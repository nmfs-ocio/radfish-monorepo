# react-radfish

![Version](https://img.shields.io/github/package-json/v/nmfs-ocio/radfish-monorepo?filename=packages/react-radfish/package.json)

The react-radfish NPM package contains the React component library needed to power any RADFish project built with React or React flavored framework (like Remix or Next.js). The idea is that these modules expose components that can be used in a consistent fashion across different React projects.

Note that this library is not meant to replace the @trussworks library, and is meant to live alongside it. Where possible, you should look to leverage the @trussworks library. However, if there is a component not exposed by @trussworks, or there is some shortcoming with the @trussworks implementation, you can rely on the components exposed from the @nmfs-ocio/react-radfish package.

## Installation

Install Radfish with npm:

```bash
npm install @nmfs-ocio/react-radfish
```

This library is open source and can be found here: https://github.com/orgs/nmfs-ocio/packages

## Usage

React-Radfish provides components like Application Container, DatePicker, and Table, which simplify building NOAA-themed applications.

```jsx
import { Application, DatePicker, Table } from '@nmfs-ocio/react-radfish';

function MyApp() {
  return (
    <Application>
      <DatePicker />
      <Table data={tableData} columns={tableColumns} />
    </Application>
  );
}

export default MyApp;
```

For detailed documentation on these custom components, please visit the [React-Radfish Design System Documentation](https://nmfs-radfish.github.io/radfish/design-system/custom-components).

## Contributing
Contributions are welcome! If you would like to contribute, please read our [contributing guide](https://nmfs-radfish.github.io/radfish/about/contribute) and follow the steps.
