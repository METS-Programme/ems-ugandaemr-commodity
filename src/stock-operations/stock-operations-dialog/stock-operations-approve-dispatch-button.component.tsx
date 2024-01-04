import React, { useCallback } from "react";

import { Button } from "@carbon/react";
import { showModal } from "@openmrs/esm-framework";
import { useTranslation } from "react-i18next";
import { Departure } from "@carbon/react/icons";
import { StockOperationDTO } from "../../core/api/types/stockOperation/StockOperationDTO";

interface StockOperationApproveDispatchButtonProps {
  operation: StockOperationDTO;
}

const StockOperationApproveDispatchButton: React.FC<
  StockOperationApproveDispatchButtonProps
> = ({ operation }) => {
  const { t } = useTranslation();
  const launchApproveDispatchModal = useCallback(() => {
    const dispose = showModal("stock-operation-dialog", {
      title: "Approve Dispatch",
      operation: operation,
      requireReason: true,
      closeModal: () => dispose(),
    });
  }, [operation]);

  return (
    <Button
      onClick={launchApproveDispatchModal}
      renderIcon={(props) => <Departure size={16} {...props} />}
    >
      {t("approve", "Approve Dispatch ")}
    </Button>
  );
};

export default StockOperationApproveDispatchButton;
