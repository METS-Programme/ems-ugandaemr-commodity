import React, { useState } from "react";
import { StockOperationDTO } from "../../core/api/types/stockOperation/StockOperationDTO";
import { SaveStockOperation } from "../../stock-items/types";
import { StockOperationType } from "../../core/api/types/stockOperation/StockOperationType";
import { InitializeResult } from "./types";
import {
  Button,
  DataTable,
  InlineLoading,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from "@carbon/react";
import { isDesktop } from "@openmrs/esm-framework";
import { StockOperationItemDTO } from "../../core/api/types/stockOperation/StockOperationItemDTO";
import { getStockOperationUniqueId } from "../stock-operation.utils";
import { useTranslation } from "react-i18next";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { stockOperationItemsSchema } from "./validationSchema";
import StockItemsAdditionRow from "./stock-items-addition-row.component";
import { Add, ArrowRight } from "@carbon/react/icons";
import styles from "./stock-items-addition.component.scss";
import { errorAlert } from "../../core/utils/alert";

interface StockItemsAdditionProps {
  isEditing?: boolean;
  canEdit?: boolean;
  model?: StockOperationDTO;
  onSave?: SaveStockOperation;
  operation: StockOperationType;
  setup: InitializeResult;
}

const StockItemsAddition: React.FC<StockItemsAdditionProps> = ({
  setup: {
    hasQtyRequested: showQuantityRequested,
    requiresBatchUuid,
    requiresActualBatchInfo: requiresActualBatchInformation,
    canCaptureQuantityPrice,
    batchBalance,
    batchNos,
    canUpdateItemsBatchInformation: canUpdateBatchInformation,
    itemUoM,
  },
  canEdit,
  model,
  onSave,
}) => {
  const { t } = useTranslation();
  const [stockOperationItems, setStockOperationItems] = useState<
    StockOperationItemDTO[]
  >([{ uuid: `new-item-1`, id: `new-item-1` }]);

  const handleSave = async (item: { stockItems: StockOperationItemDTO[] }) => {
    if (item.stockItems.length == 0) {
      errorAlert(
        "No stock items",
        "You haven't added any stock items, tap the add button to add some."
      );
      return;
    }

    // const data = Object.assign(model, item);
    model.stockOperationItems = item.stockItems;
    await onSave?.(model);
  };

  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(stockOperationItemsSchema),
    defaultValues: { stockItems: model.stockOperationItems },
    mode: "onSubmit",
  });

  const [isSaving, setIsSaving] = useState(false);

  const { fields, append, remove } = useFieldArray({
    name: "stockItems",
    control,
  });

  const headers = [
    {
      key: "item",
      header: t("item", "Item"),
      styles: { width: "40% !important" },
    },
    ...(showQuantityRequested
      ? [
          {
            key: "quantityrequested",
            header: t("quantityRequested", "Quantity Requested"),
          },
        ]
      : []),
    ...(requiresBatchUuid || requiresActualBatchInformation
      ? [
          {
            key: "batch",
            header: t("batchNo", "Batch No"),
            styles: { width: "15% !important" },
          },
        ]
      : []),
    ...(requiresActualBatchInformation
      ? [
          {
            key: "expiry",
            header: t("expiry", "Expiry"),
          },
        ]
      : []),
    ...(requiresBatchUuid
      ? [
          {
            key: "expiry",
            header: t("expiry", "Expiry"),
          },
        ]
      : []),

    {
      key: "quantity",
      header: showQuantityRequested
        ? t("qtyIssued", "Qty Issued")
        : t("qty", "Qty"),
    },
    {
      key: "quantityuom",
      header: t("quantityUom", "Qty UoM"),
    },
    ...(canCaptureQuantityPrice
      ? [
          {
            key: "purchaseprice",
            header: t("purchasePrice", "Purchase Price"),
          },
        ]
      : []),
  ];

  const addNewItem = () => {
    const itemId = `new-item-${getStockOperationUniqueId()}`;
    append({ uuid: itemId, id: itemId });
  };

  return (
    <div style={{ margin: "10px" }}>
      <div className={styles.tableContainer}>
        <DataTable
          rows={stockOperationItems}
          headers={headers}
          isSortable={false}
          useZebraStyles={true}
          styles={{
            width: "100%",
          }}
          render={({ headers, getHeaderProps, getTableProps }) => (
            <TableContainer>
              <Table {...getTableProps()}>
                <TableHead>
                  <TableRow>
                    {headers.map((header: any) => (
                      <TableHeader
                        {...getHeaderProps({
                          header,
                          isSortable: false,
                        })}
                        className={
                          isDesktop ? styles.desktopHeader : styles.tabletHeader
                        }
                        style={header?.styles}
                        key={`${header.key}`}
                      >
                        {header.header?.content ?? header.header}
                      </TableHeader>
                    ))}
                    {canEdit && (
                      <TableHeader
                        style={{
                          width: "3% !important",
                        }}
                      >
                        <div
                          style={{
                            width: "3% !important",
                            display: "flex",
                            flexDirection: "row",
                            gap: "8px",
                          }}
                        >
                          <Button
                            renderIcon={Add}
                            onClick={addNewItem}
                            hasIconOnly
                          ></Button>
                          <Button
                            name="save"
                            type="button"
                            className="submitButton"
                            onClick={handleSubmit(handleSave)}
                            kind="primary"
                            renderIcon={ArrowRight}
                          >
                            {isSaving ? <InlineLoading /> : t("next", "Next")}
                          </Button>
                        </div>
                      </TableHeader>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  <StockItemsAdditionRow
                    rows={stockOperationItems}
                    batchBalance={batchBalance}
                    batchNos={batchNos}
                    control={control}
                    setValue={setValue}
                    errors={errors}
                    remove={remove}
                    append={append}
                    canEdit={canEdit}
                    showQuantityRequested={showQuantityRequested}
                    requiresActualBatchInformation={
                      requiresActualBatchInformation
                    }
                    requiresBatchUuid={requiresBatchUuid}
                    canUpdateBatchInformation={canUpdateBatchInformation}
                    canCapturePurchasePrice={canCaptureQuantityPrice}
                    itemUoM={itemUoM}
                    fields={fields}
                  />{" "}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        ></DataTable>
      </div>
    </div>
  );
};

export default StockItemsAddition;
