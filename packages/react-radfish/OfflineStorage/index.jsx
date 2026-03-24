import { createContext, useContext } from "react";
import { StorageModelFactory } from "@nmfs-ocio/radfish";
import { useApplication } from "../Application";

export const OfflineStorageContext = createContext();

export const OfflineStorageWrapper = ({ children }) => {
  const application = useApplication();

  if (!application?.storage) {
    throw new Error(
      "OfflineStorageWrapper must be used within an Application component with a storage method configured.",
    );
  }

  const storageMethod = application.storage;
  const storageModel = StorageModelFactory.createModel(storageMethod);

  const contextValue = {
    create: (tableName, data) => {
      return storageModel.create(tableName, data);
    },
    find: (tableName, criteria) => {
      return storageModel.find(tableName, criteria);
    },
    findOne: (tableName, criteria) => {
      return storageModel.findOne(tableName, criteria);
    },
    update: (tableName, data) => {
      return storageModel.update(tableName, data);
    },
    delete: (tableName, uuid) => {
      return storageModel.delete(tableName, uuid);
    },
    storageMethod,
  };

  return (
    <OfflineStorageContext.Provider value={contextValue}>{children}</OfflineStorageContext.Provider>
  );
};

export const useOfflineStorage = () => {
  const context = useContext(OfflineStorageContext);
  if (!context) {
    throw new Error(
      "useOfflineStorage must be used within an OfflineStorageWrapper. Please make sure a storage method has been configured.",
    );
  }
  return context;
};
