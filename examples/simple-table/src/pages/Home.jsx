import React from "react";
import { Alert, Button, Link } from "@trussworks/react-uswds";
import { Table } from "@nmfs-ocio/react-radfish";

// mockData is used to populate the table with data, usually this would come from an API call.
const mockData = [
  {
    uuid: "1",
    isDraft: true,
    species: "Marlin",
    price: 50,
    image: "./sample-img.webp",
  },
  {
    uuid: "2",
    isDraft: false,
    species: "Mahimahi",
    price: 100,
    image: "./sample-img.webp",
  },
  {
    uuid: "3",
    isDraft: false,
    species: "Grouper",
    price: 80,
    image: "./sample-img.webp",
  },
  {
    uuid: "4",
    isDraft: false,
    species: "Grouper",
    price: 30,
    image: "./sample-img.webp",
  },
  {
    uuid: "5",
    isDraft: false,
    species: "Salmon",
    price: 80,
    image: "./sample-img.webp",
  },
  {
    uuid: "6",
    isDraft: true,
    species: "Salmon",
    price: 20,
    image: "./sample-img.webp",
  },
];

const HomePage = () => {
  const [data, setData] = React.useState(mockData);

  const handleSubmit = async (e, rowData) => {
    e.preventDefault();

    console.log("Form submitted for:", rowData);

    // In a real application, you would submit the data to an API here
    const updatedData = data.map((item) =>
      item.uuid === rowData.uuid ? { ...item, isDraft: false } : item,
    );

    // Update the state with the new data
    setData(updatedData);
  };

  // Define the columns for the table
  const columns = [
    {
      key: "isDraft",
      label: "Status",
      sortable: true,
      className: "status-column",
      render: (
        row, // custom render function to add a button to submit draft rows
      ) => (
        <span>
          {row.isDraft ? "Draft" : "Submitted"}
          {row.isDraft && (
            <Button
              onClick={(e) => handleSubmit(e, row)} // pass the row data to the submit function
              className="font-ui-3xs padding-3px margin-left-205"
            >
              Submit
            </Button>
          )}
        </span>
      ),
    },
    {
      key: "uuid",
      label: "Id",
      sortable: true,
    },
    {
      key: "species",
      label: "Species",
      sortable: true,
    },
    {
      key: "image",
      label: "Image",
      sortable: false,
      render: (row) => <img src={row.image} alt={row.species} height={75} width={150} />, // custom render function to display an image
    },
    {
      key: "price",
      label: "Price",
      sortable: true,
      render: (row) => <strong>${row.price}</strong>,
    },
  ];

  const onPageChange = () => {
    // This function is called when the page changes
    // and can be used to fetch data from an API
    console.log("onPageChange called");
  };

  return (
    <div className="grid-container">
      <h1>Simple Table Example</h1>
      <InfoAnnotation />
      <br />
      <Table
        data={data}
        columns={columns}
        paginationOptions={{
          pageSize: 3,
          currentPage: 1,
          onPageChange: onPageChange,
          totalRows: data.length,
        }}
        onRowClick={(row) => {
          console.log("Row clicked:", row);
        }}
        defaultSort={[
          { key: "price", direction: "asc" },
          { key: "species", direction: "desc" },
        ]}
        striped
        bordered
      />
    </div>
  );
};

export default HomePage;

function InfoAnnotation() {
  return (
    <Alert type="info" headingLevel={"h2"} heading="Information">
      Below is an example of a table that's populated by mock data and uses the{" "}
      <Link
        href="https://nmfs-radfish.github.io/radfish/design-system/custom-components/table"
        target="_blank"
        rel="noopener noreferrer"
      >
        <strong>Table</strong>
      </Link>{" "}
      component to display the data.
      <br />
      <br />
      <strong>Sorting:</strong> Click on any column header to sort the table by that column.
      Clicking the header toggles between ascending, descending, and unsorted states.
      <br />
      <br />
      <strong>Multi-Column Sorting:</strong> To sort by multiple columns, click on additional column
      headers. The order in which you click the headers determines their sorting priority.
      <br />
      <br />
      <strong>Pagination:</strong> Use the pagination controls below the table to navigate through
      pages of data. You can go to the first page, previous page, next page, or last page. The
      current page number and total pages are displayed to help you keep track of your position in
      the dataset.
      <br />
      <br />
      <strong>
        <i>Note:</i>
      </strong>{" "}
      Annotations are for informational purposes only. In production, you would remove the
      annotations. Components with annotations above them are optional. You can choose whether or
      not to use them in your application.
      <br />
      <br />
      <Link
        href="https://nmfs-radfish.github.io/radfish/design-system/custom-components/table"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button type="button">Go To Documentation</Button>
      </Link>
      <Link
        href="https://github.com/NMFS-RADFish/boilerplate/blob/main/examples/simple-table/README.md"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button type="button">Go To Example README</Button>
      </Link>
    </Alert>
  );
}
