import React, { useEffect, useMemo } from "react";
import { ResourceRepresentation } from "../../../core/api/api";
import { useStockItemsTransactions } from "./transactions.resource";
import { DataTableSkeleton, Link, Tile } from "@carbon/react";
import { formatDisplayDate } from "../../../core/utils/datetimeUtils";
import { ArrowLeft } from "@carbon/react/icons";
import { URL_STOCK_OPERATION } from "../../stock-items-table.component";
import DataList from "../../../core/components/table/table.component";
import styles from "../../stock-items-table.scss";

interface TransactionsProps {
  onSubmit?: () => void;
  stockItemUuid: string;
}

const Transactions: React.FC<TransactionsProps> = ({ stockItemUuid }) => {
  const {
    isLoading,
    items,
    tableHeaders,

    totalCount,
    setCurrentPage,
    setStockItemUuid,
  } = useStockItemsTransactions(ResourceRepresentation.Default);

  useEffect(() => {
    setStockItemUuid(stockItemUuid);
  }, [stockItemUuid, setStockItemUuid]);

  const tableRows = useMemo(() => {
    return items?.map((stockItemTransaction) => ({
      ...stockItemTransaction,
      id: stockItemTransaction?.uuid,
      key: `key-${stockItemTransaction?.uuid}`,
      uuid: `${stockItemTransaction?.uuid}`,
      date: formatDisplayDate(stockItemTransaction?.dateCreated),
      location:
        stockItemTransaction.operationSourcePartyName &&
        stockItemTransaction.operationDestinationPartyName ? (
          stockItemTransaction.operationSourcePartyName ===
          stockItemTransaction?.partyName ? (
            stockItemTransaction.quantity > 0 ? (
              <>
                <span className="transaction-location">
                  {stockItemTransaction.operationSourcePartyName}
                </span>
                <ArrowLeft size={16} />{" "}
                {stockItemTransaction.operationDestinationPartyName}
              </>
            ) : (
              <>
                <span className="transaction-location">
                  {stockItemTransaction.operationSourcePartyName}
                </span>
                <ArrowLeft size={16} />{" "}
                {stockItemTransaction.operationDestinationPartyName}
              </>
            )
          ) : stockItemTransaction.operationDestinationPartyName ===
            stockItemTransaction?.partyName ? (
            stockItemTransaction.quantity > 0 ? (
              <>
                <span className="transaction-location">
                  {stockItemTransaction.operationDestinationPartyName}
                </span>
                <ArrowLeft size={16} />{" "}
                {stockItemTransaction.operationSourcePartyName}
              </>
            ) : (
              <>
                <span className="transaction-location">
                  {stockItemTransaction.operationDestinationPartyName}
                </span>
                <ArrowLeft size={16} />{" "}
                {stockItemTransaction.operationSourcePartyName}
              </>
            )
          ) : (
            stockItemTransaction?.partyName
          )
        ) : (
          stockItemTransaction?.partyName
        ),
      transaction: stockItemTransaction?.isPatientTransaction
        ? "Patient Dispense"
        : stockItemTransaction.stockOperationTypeName,
      quantity: `${stockItemTransaction?.quantity?.toLocaleString()} ${
        stockItemTransaction?.packagingUomName ?? ""
      }`,
      batch: stockItemTransaction.stockBatchNo
        ? `${stockItemTransaction.stockBatchNo}${
            stockItemTransaction.expiration
              ? ` (${formatDisplayDate(stockItemTransaction.expiration)})`
              : ""
          }`
        : "",
      reference: stockItemTransaction?.stockOperationUuid ? (
        <Link
          to={URL_STOCK_OPERATION(stockItemTransaction?.stockOperationUuid)}
          target={"_blank"}
        >{`${stockItemTransaction?.stockOperationNumber}`}</Link>
      ) : (
        <></>
      ),
      status: stockItemTransaction?.stockOperationStatus ?? "",
      in:
        stockItemTransaction?.quantity >= 0
          ? `${stockItemTransaction?.quantity?.toLocaleString()} ${
              stockItemTransaction?.packagingUomName ?? ""
            }`
          : "",
      out:
        stockItemTransaction?.quantity < 0
          ? `${(-1 * stockItemTransaction?.quantity)?.toLocaleString()} ${
              stockItemTransaction?.packagingUomName ?? ""
            }`
          : "",
    }));
  }, [items]);

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" />;
  }

  if (items?.length != undefined) {
    return (
      <DataList
        columns={tableHeaders}
        data={tableRows}
        totalItems={totalCount}
        goToPage={setCurrentPage}
        hasToolbar={false}
      />
    );
  }

  return (
    <div className={styles.tileContainer}>
      <Tile className={styles.tile}>
        <p className={styles.content}>No transactions to display</p>
      </Tile>
    </div>
  );
};

export default Transactions;
