import React from "react";
import { Button } from "@carbon/react";
import { StockOperationDTO } from "../../core/api/types/stockOperation/StockOperationDTO";
import { launchAddOrEditDialog } from "../stock-operation.utils";
import { StockOperationType } from "../../core/api/types/stockOperation/StockOperationType";
interface EditStockOperationActionMenuProps {
  model: StockOperationDTO;
  operations: StockOperationType[];
}
const EditStockOperationActionMenu: React.FC<
  EditStockOperationActionMenuProps
> = ({ model, operations }) => {
  const type: StockOperationType = {
    uuid: "",
    name: "",
    description: "",
    operationType: "",
    hasSource: false,
    sourceType: "Location",
    hasDestination: false,
    destinationType: "Location",
    hasRecipient: false,
    recipientRequired: false,
    availableWhenReserved: false,
    allowExpiredBatchNumbers: false,
    stockOperationTypeLocationScopes: [],
    creator: undefined,
    dateCreated: undefined,
    changedBy: undefined,
    dateChanged: undefined,
    dateVoided: undefined,
    voidedBy: undefined,
    voidReason: "",
    voided: false,
  };

  return (
    <>
      <Button
        type="button"
        size="sm"
        className="submitButton clear-padding-margin"
        iconDescription={"View"}
        kind="ghost"
        onClick={() => {
          launchAddOrEditDialog(model, true, type, operations, false);
        }}
      >
        {`${model?.operationNumber}`}
      </Button>
    </>
  );
};

export default EditStockOperationActionMenu;
