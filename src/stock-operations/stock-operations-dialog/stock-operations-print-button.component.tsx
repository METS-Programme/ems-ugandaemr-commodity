import React, { useCallback, useMemo, useState } from "react";

import { Button } from "@carbon/react";
import { showModal } from "@openmrs/esm-framework";
import { useTranslation } from "react-i18next";
import { Printer } from "@carbon/react/icons";
import { StockOperationDTO } from "../../core/api/types/stockOperation/StockOperationDTO";

interface StockOperationCancelButtonProps {
  operation: StockOperationDTO;
}

const StockOperationPrintButton: React.FC<StockOperationCancelButtonProps> = ({
  operation,
}) => {
  const { t } = useTranslation();
  const launchPrintModal = useCallback(() => {
    const dispose = showModal("stock-operation-dialog", {
      title: "Print",
      operation: operation,
      closeModal: () => dispose(),
    });
  }, [operation]);

  return (
    <Button
      onClick={launchPrintModal}
      kind="tertiary"
      renderIcon={(props) => <Printer size={16} {...props} />}
    >
      {t("print", "Print ")}
    </Button>
  );
};

export default StockOperationPrintButton;
