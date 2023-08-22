import {
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Form,
  Select,
  TextInput,
  SelectItem,
} from "@carbon/react";
import React, { ChangeEvent, useCallback, useState } from "react";
import styles from "./add-stock-sources.scss";
import { useConceptById } from "../../stock-lookups/stock-lookups.resource";
import { STOCK_SOURCE_TYPE_CODED_CONCEPT_ID } from "../../constants";
import { StockSource } from "../../core/api/types/stockOperation/StockSource";
import { createOrUpdateStockSource } from "../stock-sources.resource";
import { showNotification, showToast } from "@openmrs/esm-framework";
import { useTranslation } from "react-i18next";

const StockSourcesAddOrCreate: React.FC = () => {
  const { t } = useTranslation();

  // get stock sources
  const { items, isLoading, isError } = useConceptById(
    STOCK_SOURCE_TYPE_CODED_CONCEPT_ID
  );

  const [formModel, setFormModel] = useState<StockSource>();

  const onNameChanged = (evt: React.ChangeEvent<HTMLInputElement>): void => {
    setFormModel({ ...formModel, name: evt.target.value });
  };

  const onAcronymChanged = (evt: React.ChangeEvent<HTMLInputElement>): void => {
    setFormModel({ ...formModel, acronym: evt.target.value });
  };

  const onSourceTypeChange = (evt: ChangeEvent<HTMLSelectElement>) => {
    const selectedSourceType = items?.answers.find(
      (x) => x.uuid === evt.target.value
    );
    setFormModel({ ...formModel, sourceType: selectedSourceType });
  };

  const onFormSubmit = useCallback(
    (event) => {
      event.preventDefault();
      createOrUpdateStockSource(formModel)
        .then(
          () => {
            showToast({
              critical: true,
              title: t("addedSource", "Add Source"),
              kind: "success",
              description: t(
                "stocksourceaddedsuccessfully",
                "Stock Source Added Successfully"
              ),
            });
          },
          (error) => {
            showNotification({
              title: t(`errorAddingSource', 'error adding a source`),
              kind: "error",
              critical: true,
              description: error?.message,
            });
          }
        )
        .catch();
    },
    [formModel, t]
  );
  return (
    <div>
      <Form onSubmit={onFormSubmit}>
        <ModalHeader />
        <ModalBody>
          <section className={styles.section}>
            <TextInput
              id="fullname"
              type="text"
              labelText="FullName"
              size="md"
              onChange={onNameChanged}
              placeholder="e.g National Medical Stores"
            />
          </section>
          <section className={styles.section}>
            <TextInput
              id="acronym"
              type="text"
              size="md"
              placeholder="e.g NMS"
              onChange={onAcronymChanged}
              labelText="Acronym/Code"
            />
          </section>
          <section className={styles.section}>
            <Select
              name="sourceType"
              className="select-field"
              labelText={"Source Type"}
              id="sourceType"
              onChange={onSourceTypeChange}
            >
              <SelectItem
                disabled
                hidden
                value="placeholder-item"
                text="Choose a source type"
              />
              {items?.answers?.map((sourceType) => {
                return (
                  <SelectItem
                    key={sourceType.uuid}
                    value={sourceType.uuid}
                    text={sourceType.display}
                  />
                );
              })}
            </Select>
          </section>
        </ModalBody>
        <ModalFooter>
          <Button kind="secondary">Cancel</Button>
          <Button type="submit">Save</Button>
        </ModalFooter>
      </Form>
    </div>
  );
};

export default StockSourcesAddOrCreate;