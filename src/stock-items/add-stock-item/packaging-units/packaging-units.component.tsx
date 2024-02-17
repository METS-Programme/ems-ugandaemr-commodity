import React, { useEffect, useMemo } from "react";
import { useStockItemPackageUnitsHook } from "./packaging-units.resource";
import {
  Button,
  DataTable,
  DataTableSkeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from "@carbon/react";
import PackagingUnitsConceptSelector from "../packaging-units-concept-selector/packaging-units-concept-selector.component";
import ControlledNumberInput from "../../../core/components/carbon/controlled-number-input/controlled-number-input.component";
import { Save, TrashCan } from "@carbon/react/icons";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PackageUnitFormData, packageUnitSchema } from "./validationSchema";
import { StockItemPackagingUOMDTO } from "../../../core/api/types/stockItem/StockItemPackagingUOM";
import {
  createStockItemPackagingUnit,
  deleteStockItemPackagingUnit,
} from "../../stock-items.resource";
import {
  showNotification,
  showSnackbar,
  showToast,
} from "@openmrs/esm-framework";
import { useTranslation } from "react-i18next";
import styles from "./packaging-units.scss";

interface PackagingUnitsProps {
  isEditing?: boolean;
  onSubmit?: () => void;
  stockItemUuid: string;
  handleTabChange: (index) => void;
}

const PackagingUnits: React.FC<PackagingUnitsProps> = ({
  isEditing,
  stockItemUuid,
  handleTabChange,
}) => {
  const { items, isLoading, setStockItemUuid } = useStockItemPackageUnitsHook();
  useEffect(() => {
    setStockItemUuid(stockItemUuid);
  }, [stockItemUuid, setStockItemUuid]);

  const { t } = useTranslation();
  const tableHeaders = useMemo(
    () => [
      {
        key: "packaging",
        header: t("packagingUnit", "Packaging Unit"),
        styles: { width: "50%" },
      },
      {
        key: "quantity",
        header: t("quantity", "Quantity"),
        styles: { width: "50%" },
      },
      {
        key: "action",
        header: t("action", "Actions"),
        styles: { width: "50%" },
      },
    ],
    []
  );

  const packageUnitForm = useForm<PackageUnitFormData>({
    defaultValues: {},
    mode: "all",
    resolver: zodResolver(packageUnitSchema),
  });

  const handleSavePackageUnits = () => {
    const { getValues } = packageUnitForm;
    const { factor, packagingUomUuid } = getValues();
    const payload: StockItemPackagingUOMDTO = {
      factor: factor,
      packagingUomUuid,
      stockItemUuid,
    };
    createStockItemPackagingUnit(payload).then(
      () =>
        showSnackbar({
          title: t("savePackingUnitTitle", "Package Unit"),
          subtitle: t(
            "savePackingUnitMessage",
            "Package Unit saved successfully"
          ),
          kind: "success",
        }),
      () => {
        showSnackbar({
          title: t("savePackagingUnitErrorTitle", "Package Unit"),
          subtitle: t(
            "savePackagingUnitErrorMessage",
            "Error saving package unit"
          ),
          kind: "error",
        });
      }
    );
    handleTabChange(0);
  };

  if (isLoading)
    return (
      <DataTableSkeleton
        showHeader={false}
        rowCount={5}
        columnCount={5}
        zebra
      />
    );

  return (
    <FormProvider {...packageUnitForm}>
      <DataTable
        rows={[...items, {}]}
        headers={tableHeaders}
        isSortable={false}
        useZebraStyles={true}
        render={({ headers, getHeaderProps, getTableProps }) => (
          <TableContainer className={styles.packagingTableContainer}>
            <Table {...getTableProps()} className={styles.packingTable}>
              <TableHead>
                <TableRow>
                  {headers.map((header) => (
                    <TableHeader
                      {...getHeaderProps({
                        header,
                        isSortable: false,
                      })}
                      style={header.styles}
                      key={header.key}
                    >
                      {header.header?.content ?? header.header}
                    </TableHeader>
                  ))}
                  <TableHeader style={{ width: "70%" }} />
                </TableRow>
              </TableHead>
              <TableBody className={styles.packingTableBody}>
                {items?.map((row: StockItemPackagingUOMDTO, index) => (
                  <PackagingUnitRow row={row} key={`${index}-${row?.uuid}`} />
                ))}
                <PackagingUnitRow row={{}} key="bottom-row" isEditing />
              </TableBody>
            </Table>
          </TableContainer>
        )}
      />

      <Button
        name="save"
        type="submit"
        className="submitButton"
        onClick={handleSavePackageUnits}
        kind="primary"
        renderIcon={Save}
      >
        {t("save", "Save")}
      </Button>
    </FormProvider>
  );
};

export default PackagingUnits;

const PackagingUnitRow: React.FC<{
  isEditing?: boolean;
  row: StockItemPackagingUOMDTO;
  key?: string;
}> = ({ isEditing, row, key }) => {
  const { t } = useTranslation();

  const {
    control,
    formState: { errors },
  } = useFormContext();

  const handleDelete = (e) => {
    e.preventDefault();
    deleteStockItemPackagingUnit(row.uuid).then(
      () => {
        showToast({
          critical: true,
          title: t("deletePackagingUnitTitle", `Delete packing item `),
          kind: "success",
          description: t(
            "deletePackagingUnitMesaage",
            `Stock Item packing unit deleted Successfully`
          ),
        });
      },
      (error) => {
        showNotification({
          title: t(
            "deletePackingUnitErrorTitle",
            `Error Deleting a stock item packing unit`
          ),
          kind: "error",
          critical: true,
          description: error?.message,
        });
      }
    );
  };

  return (
    <TableRow>
      <TableCell>
        {isEditing ? (
          <PackagingUnitsConceptSelector
            row={row}
            controllerName={"packagingUomUuid"}
            name="packagingUomUuid"
            control={control}
            invalid={!!errors.packagingUomUuid}
          />
        ) : (
          (!isEditing || !row.uuid.startsWith("new-item")) &&
          row?.packagingUomName
        )}
      </TableCell>
      <TableCell>
        <div className={styles.packingTableCell}>
          <ControlledNumberInput
            row={row}
            controllerName="factor"
            name="factor"
            control={control}
            id={`${row.uuid}-${key}`}
            invalid={!!errors.factor}
          />

          <Button
            type="button"
            size="sm"
            className="submitButton clear-padding-margin"
            iconDescription={"Delete"}
            kind="ghost"
            renderIcon={TrashCan}
            onClick={(e) => handleDelete(e)}
          />
        </div>
      </TableCell>
    </TableRow>
  );
};
