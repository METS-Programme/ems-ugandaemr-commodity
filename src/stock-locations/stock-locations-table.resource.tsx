import { StockOperationFilter } from "../stock-operations/stock-operations.resource";
import { useMemo, useState } from "react";
import {
  FetchResponse,
  openmrsFetch,
  restBaseUrl,
  showToast,
  usePagination,
} from "@openmrs/esm-framework";
import { useTranslation } from "react-i18next";
import {
  useStockLocations,
  useStockTagLocations,
} from "../stock-lookups/stock-lookups.resource";
import useSWR from "swr";
import { extractErrorMessagesFromResponse } from "../constants";

export function useStockLocationPages(filter: StockOperationFilter) {
  const { stockLocations, error, isLoading } = useStockTagLocations();

  const pageSizes = [10, 20, 30, 40, 50];
  const [currentPageSize, setPageSize] = useState(10);

  const {
    goTo,
    results: paginatedQueueEntries,
    currentPage,
  } = usePagination(stockLocations, currentPageSize);

  const { t } = useTranslation();

  const tableHeaders = useMemo(
    () => [
      {
        id: 0,
        header: t("name", "Name"),
        key: "name",
      },
      {
        id: 1,
        header: t("tags", "Tags"),
        key: "tags",
      },
      {
        id: 2,
        header: t("childLocations", "Child Locations"),
        key: "childLocations",
      },
      {
        id: 3,
        header: t("actions", "Actions"),
        key: "actions",
      },
    ],
    [t]
  );

  const tableRows = useMemo(() => {
    return stockLocations.map((location) => ({
      id: location?.uuid,
      key: `key-${location?.uuid}`,
      uuid: `${location?.uuid}`,
      name: `${location?.name}`,
      tags:
        location?.meta.tag
          ?.filter((tag) => tag.code !== "SUBSETTED")
          .map((p) => p.code)
          ?.join(", ") ?? "",
      childLocations:
        location?.childLocations?.map((p) => p.display)?.join(", ") ?? "",
    }));
  }, [stockLocations]);
  return {
    items: stockLocations,
    currentPage,
    currentPageSize,
    paginatedQueueEntries,
    goTo,
    pageSizes,
    isLoading,
    error,
    setPageSize,
    tableHeaders,
    tableRows,
  };
}

export const useLocationTags = () => {
  const url = `${restBaseUrl}/locationtag/`;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { data, error, isLoading, isValidating, mutate } = useSWR<
    { data },
    Error
  >(url, openmrsFetch);
  const results = data?.data?.results ? data?.data?.results : [];
  return {
    locationTagList: results,
    loading: isLoading,
    mutate,
  };
};
interface LocationName {
  name: string;
}
export async function saveLocation({
  locationPayload,
}): Promise<FetchResponse<LocationName>> {
  try {
    const response: FetchResponse = await openmrsFetch(
      `${restBaseUrl}/location/`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: locationPayload,
      }
    );
    return response;
  } catch (error) {
    const errorMessages = extractErrorMessagesFromResponse(error);
    showToast({
      description: errorMessages.join(", "),
      title: "Error on saving form",
      kind: "error",
      critical: true,
    });
  }
}
