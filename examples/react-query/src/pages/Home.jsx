import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Alert, Label, Link, TextInput } from "@trussworks/react-uswds";
import { dispatchToast } from "@nmfs-ocio/react-radfish";
import { Table } from "@nmfs-ocio/react-radfish";

const HomePage = () => {
  const queryClient = useQueryClient();

  /**
   * This is a custom hook that fetches data from the server and allows you to pass a select function to filter the data.
   * Even if you call this hook multiple times, the data will only be fetched once.
   * Read more: https://tkdodo.eu/blog/react-query-data-transformations
   */
  const useSpeciesQuery = (selectFn = ({ data }) => data) => {
    return useQuery({
      queryKey: ["species"],
      queryFn: async () => {
        dispatchToast({
          status: "info",
          message: "Fetching species data...",
          duration: 3000,
        });
        const response = await fetch(`/species`);

        return response.json();
      },
      select: selectFn,
      refetchInterval: 15000,
    });
  };

  // This always returns the total number of species fetched from the server.
  const { data: totalSpeciesCount } = useSpeciesQuery(
    ({ data }) => data.length,
  );

  // A simple filter to only show species with a price greater than the minimum price.
  const [minimumPrice, setMinimumPrice] = useState(0);
  const { data } = useSpeciesQuery(({ data }) => {
    return data.filter((species) => species.price > minimumPrice);
  });

  return (
    <>
      <h1>React Query Example</h1>
      <InfoAnnotation />
      <br />
      <Button
        onClick={async () => {
          await new Promise((resolve) => setTimeout(resolve, 3000));
          queryClient.invalidateQueries({ queryKey: ["species"] });
        }}
      >
        Refetch Data
      </Button>
      <pre>Total number of species: {totalSpeciesCount}</pre>
      <Label htmlFor="minimum-price-input">Minimum Price filter</Label>
      <TextInput
        id="minimum-price-input"
        type="number"
        label="Minimum Price"
        defaultValue={minimumPrice}
        min={0}
        onChange={(e) => setMinimumPrice(Math.max(0, Number(e.target.value)))}
      />
      {data && (
        <Table
          fullWidth
          bordered
          data={data}
          columns={[
            { key: "name", label: "Name" },
            {
              key: "price",
              label: "Price",
            },
          ]}
        />
      )}
    </>
  );
};

const InfoAnnotation = () => {
  return (
    <Alert type="info" heading="Information" headingLevel="h2">
      This is an example of how to use the <code>QueryClientProvider</code>
      to fetch data from your server. The data is fetched every 30 seconds, and
      can be manually refetched by clicking the "Refetch Data" button.
      <br />
      <br />
      <Link
        href="https://nmfs-radfish.github.io/radfish"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button type="button">Go To Documentation</Button>
      </Link>
    </Alert>
  );
};

export default HomePage;
