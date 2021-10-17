import { createContext, useState } from 'react'
import jsTPS from '../common/jsTPS'
import api from '../api'
import MoveItem_Transaction from '../transactions/MoveItem_Transaction'
import EditItem_Transaction from '../transactions/EditItem_Transaction'
export const GlobalStoreContext = createContext({});
/*
    This is our global data store. Note that it uses the Flux design pattern,
    which makes use of things like actions and reducers. 
    
    @author McKilla Gorilla
*/

// THESE ARE ALL THE TYPES OF UPDATES TO OUR GLOBAL
// DATA STORE STATE THAT CAN BE PROCESSED
export const GlobalStoreActionType = {
    CHANGE_LIST_NAME: "CHANGE_LIST_NAME",
    CLOSE_CURRENT_LIST: "CLOSE_CURRENT_LIST",
    LOAD_ID_NAME_PAIRS: "LOAD_ID_NAME_PAIRS",
    SET_CURRENT_LIST: "SET_CURRENT_LIST",
    SET_LIST_NAME_EDIT_ACTIVE: "SET_LIST_NAME_EDIT_ACTIVE",
    SET_ITEM_EDIT_ACTIVE: "SET_ITEM_EDIT_ACTIVE"
}

// WE'LL NEED THIS TO PROCESS TRANSACTIONS
const tps = new jsTPS();

// WITH THIS WE'RE MAKING OUR GLOBAL DATA STORE
// AVAILABLE TO THE REST OF THE APPLICATION
export const useGlobalStore = () => {
    // THESE ARE ALL THE THINGS OUR DATA STORE WILL MANAGE
    const [store, setStore] = useState({
        idNamePairs: [],
        currentList: null,
        newListCounter: 0,
        isListNameEditActive: false,
        isItemEditActive: false,
        listMarkedForDeletion: null,
        canUndo: false,
        canRedo: false,
        canCloseList: false
    });

    // HERE'S THE DATA STORE'S REDUCER, IT MUST
    // HANDLE EVERY TYPE OF STATE CHANGE
    const storeReducer = (action) => {
        const { type, payload } = action;
        switch (type) {
            // LIST UPDATE OF ITS NAME
            case GlobalStoreActionType.CHANGE_LIST_NAME: {
                return setStore({
                    idNamePairs: payload.idNamePairs,
                    currentList: payload.top5List,
                    newListCounter: store.newListCounter,
                    isListNameEditActive: false,
                    isItemEditActive: false,
                    listMarkedForDeletion: null,
                    canUndo: false,
                    canRedo: false,
                    canCloseList: false
                });
            }
            // STOP EDITING THE CURRENT LIST
            case GlobalStoreActionType.CLOSE_CURRENT_LIST: {
                return setStore({
                    idNamePairs: store.idNamePairs,
                    currentList: null,
                    newListCounter: store.newListCounter,
                    isListNameEditActive: false,
                    isItemEditActive: false,
                    listMarkedForDeletion: null,
                    canUndo: false,
                    canRedo: false,
                    canCloseList: false
                })
            }
            // GET ALL THE LISTS SO WE CAN PRESENT THEM
            case GlobalStoreActionType.LOAD_ID_NAME_PAIRS: {
                return setStore({
                    idNamePairs: payload,
                    currentList: null,
                    newListCounter: store.newListCounter,
                    isListNameEditActive: false,
                    isItemEditActive: false,
                    listMarkedForDeletion: null,
                    canUndo: false,
                    canRedo: false,
                    canCloseList: false
                });
            }
            // UPDATE A LIST           OPENS A LIST
            case GlobalStoreActionType.SET_CURRENT_LIST: {
                return setStore({
                    idNamePairs: store.idNamePairs,
                    currentList: payload.currentList,
                    newListCounter: store.newListCounter,
                    isListNameEditActive: false,
                    isItemEditActive: false,
                    listMarkedForDeletion: null,
                    canUndo: payload.undoBool,
                    canRedo: payload.redoBool,
                    canCloseList: payload.closeListBool
                });
            }
            // START EDITING A LIST NAME
            case GlobalStoreActionType.SET_LIST_NAME_EDIT_ACTIVE: {
                return setStore({
                    idNamePairs: store.idNamePairs,
                    currentList: payload,
                    newListCounter: store.newListCounter,
                    isListNameEditActive: true,
                    isItemEditActive: false,
                    listMarkedForDeletion: null,
                    canUndo: false,
                    canRedo: false,
                    canCloseList: false
                });
            }
            // START EDITING AN ITEM
            case GlobalStoreActionType.SET_ITEM_EDIT_ACTIVE: {
                return setStore({
                    idNamePairs: store.idNamePairs,
                    currentList: store.currentList,
                    newListCounter: store.newListCounter,
                    isListNameEditActive: false,
                    isItemEditActive: payload.toggleEditActive,
                    listMarkedForDeletion: null,
                    canUndo: false, //payload.undoBool,
                    canRedo: false, //payload.redoBool,
                    canCloseList: false //payload.closeListBool
                });
            }
            // MARK LIST FOR DELETION
            case GlobalStoreActionType.MARK_LIST_DELETE: {
                return setStore({
                    idNamePairs: store.idNamePairs,
                    currentList: null,
                    newListCounter: store.newListCounter,
                    isListNameEditActive: false,
                    isItemEditActive: false,
                    listMarkedForDeletion: payload,
                    canUndo: false,
                    canRedo: false,
                    canCloseList: false
                })
            }
            default:
                return store;
        }
    }
    // THESE ARE THE FUNCTIONS THAT WILL UPDATE OUR STORE AND
    // DRIVE THE STATE OF THE APPLICATION. WE'LL CALL THESE IN 
    // RESPONSE TO EVENTS INSIDE OUR COMPONENTS.

    // THIS FUNCTION PROCESSES CHANGING A LIST NAME
    store.changeListName = function (id, newName) {
        // GET THE LIST
        async function asyncChangeListName(id) {
            let response = await api.getTop5ListById(id);
            if (response.data.success) {
                let top5List = response.data.top5List;
                // handle no name change
                if (newName !== "") {
                    top5List.name = newName;
                } 
                async function updateList(top5List) {
                    response = await api.updateTop5ListById(top5List._id, top5List);
                    if (response.data.success) {
                        async function getListPairs(top5List) {
                            response = await api.getTop5ListPairs();
                            if (response.data.success) {
                                let pairsArray = response.data.idNamePairs;
                                storeReducer({
                                    type: GlobalStoreActionType.CHANGE_LIST_NAME,
                                    payload: {
                                        idNamePairs: pairsArray,
                                        top5List: top5List
                                    }
                                });
                                //console.log(store)
                            }
                        }
                        getListPairs(top5List);
                    }
                }
                updateList(top5List);
            }
        }
        asyncChangeListName(id);
    }

    // THIS FUNCTION PROCESSES CLOSING THE CURRENTLY LOADED LIST
    store.closeCurrentList = function () {
        tps.clearAllTransactions();
        storeReducer({
            type: GlobalStoreActionType.CLOSE_CURRENT_LIST,
            payload: {}
        });
    }

    // THIS FUNCTION CREATES A NEW LIST
    store.createNewList = function () {
        async function asyncCreateNewList() {
            let emptyList = {
                "name": "Untitled"+store.newListCounter++,
                "items": ["?","?","?","?","?"]
            }
            //console.log("empty list created")
            const response = await api.createTop5List(emptyList);
            if (response.data.success) {
                //console.log("empty list successfully sent to api and db", response.data.top5List._id)
                /*
                storeReducer({
                    type: GlobalStoreActionType.SET_LIST_NAME_EDIT_ACTIVE,
                    payload: null
                })
                */
               store.setCurrentList(response.data.top5List._id)
            } else {
                console.log("API FAILED TO CREATE NEW LIST")
            }
        }
        asyncCreateNewList();
    }

    // THIS FUNCTION LOADS ALL THE ID, NAME PAIRS SO WE CAN LIST ALL THE LISTS
    store.loadIdNamePairs = function () {
        async function asyncLoadIdNamePairs() {
            try {
                const response = await api.getTop5ListPairs();
            } catch (error) {
                // Error that occurs is because there are no pairs in the list (before or after deleting the last list)
                storeReducer({
                    type: GlobalStoreActionType.LOAD_ID_NAME_PAIRS,
                    payload: []
                });
                return
            }
            // No error means the final list wasn't deleted or that there are still lists exisitng
            const response = await api.getTop5ListPairs();
            if (response.data.success) {
                let pairsArray = response.data.idNamePairs;
                storeReducer({
                    type: GlobalStoreActionType.LOAD_ID_NAME_PAIRS,
                    payload: pairsArray
                });
            }
            else {
                console.log("API FAILED TO GET THE LIST PAIRS");
            }
        }
        asyncLoadIdNamePairs();
    }

    // THE FOLLOWING 8 FUNCTIONS ARE FOR COORDINATING THE UPDATING
    // OF A LIST, WHICH INCLUDES DEALING WITH THE TRANSACTION STACK. THE
    // FUNCTIONS ARE setCurrentList, addMoveItemTransaction, addUpdateItemTransaction,
    // moveItem, updateItem, updateCurrentList, undo, and redo
    store.setCurrentList = function (id) {
        //console.log("TPS CURRENTLY", tps)
        async function asyncSetCurrentList(id) {
            let response = await api.getTop5ListById(id);
            if (response.data.success) {
                let top5List = response.data.top5List;

                response = await api.updateTop5ListById(top5List._id, top5List);
                if (response.data.success) {
                    storeReducer({
                        type: GlobalStoreActionType.SET_CURRENT_LIST,
                        payload: {
                            currentList: top5List,
                            undoBool: tps.hasTransactionToUndo(),
                            redoBool: tps.hasTransactionToRedo(),
                            closeListBool: true
                        }
                    });
                    store.history.push("/top5list/" + top5List._id);
                }
            }
        }
        asyncSetCurrentList(id);
    }
    store.addUpdateItemTransaction = function (index, newText, oldText) {
        let transaction = new EditItem_Transaction(store, index, newText, oldText);
        tps.addTransaction(transaction);
    }

    store.editItem = function (index, newText) {
        //console.log("index, text", index, newText, store.currentList)
        store.currentList.items[index] = newText
        store.updateCurrentList();
    }

    store.addMoveItemTransaction = function (start, end) {
        let transaction = new MoveItem_Transaction(store, start, end);
        tps.addTransaction(transaction);
    }
    store.moveItem = function (start, end) {
        start -= 1;
        end -= 1;
        if (start < end) {
            let temp = store.currentList.items[start];
            for (let i = start; i < end; i++) {
                store.currentList.items[i] = store.currentList.items[i + 1];
            }
            store.currentList.items[end] = temp;
        }
        else if (start > end) {
            let temp = store.currentList.items[start];
            for (let i = start; i > end; i--) {
                store.currentList.items[i] = store.currentList.items[i - 1];
            }
            store.currentList.items[end] = temp;
        }

        // NOW MAKE IT OFFICIAL
        store.updateCurrentList();
    }
    store.updateCurrentList = function() {
        async function asyncUpdateCurrentList() {
            //console.log("EVERYTHING CALLS UPDATECURRENTLIST")
            const response = await api.updateTop5ListById(store.currentList._id, store.currentList);
            if (response.data.success) {
                storeReducer({
                    type: GlobalStoreActionType.SET_CURRENT_LIST,
                    payload: {
                        currentList: store.currentList,
                        undoBool: tps.hasTransactionToUndo(),
                        redoBool: tps.hasTransactionToRedo(),
                        closeListBool: true
                    }
                });
            }
        }
        asyncUpdateCurrentList();
    }
    store.undo = function () {
        tps.undoTransaction();
    }
    store.redo = function () {
        tps.doTransaction();
    }

    // THIS FUNCTION ENABLES THE PROCESS OF EDITING A LIST NAME
    store.setIsListNameEditActive = function () {
        storeReducer({
            type: GlobalStoreActionType.SET_LIST_NAME_EDIT_ACTIVE,
            payload: null
        });
    }

    // THIS FUNCTION ENABLES THE PROCESS OF EDITING A TOP5ITEM
    store.setIsItemEditActive = function () {
        //console.log("isItemEditActive will now be updated to:", !store.isItemEditActive)
        async function asyncsetIsItemEditActive() {
                storeReducer({
                type: GlobalStoreActionType.SET_ITEM_EDIT_ACTIVE,
                payload: {
                    toggleEditActive: !store.isItemEditActive,
                    undoBool: tps.hasTransactionToUndo(),
                    redoBool: tps.hasTransactionToRedo(),
                    closeListBool: true
                }
            });
        }
        asyncsetIsItemEditActive();
    }

    store.markForDeletion = function (idAndNamePair) {
        async function asyncMarkForDeletion(idAndNamePairId) {
            const response = await api.getTop5ListById(idAndNamePairId)
            if (response.data.success) {
                storeReducer({
                    type: GlobalStoreActionType.MARK_LIST_DELETE,
                    payload: response.data.top5List
                })
            }
            store.showDeleteListModal()
        }
        asyncMarkForDeletion(idAndNamePair._id)
    }

    store.showDeleteListModal = function () {
        let modal = document.getElementById("delete-modal");
        modal.classList.add("is-visible");
    }

    store.deleteMarkedList = function () {
        async function asyncDeleteMarkedList() {
            const response = await api.deleteTop5ListById(store.listMarkedForDeletion._id)
            if (response.data.success) {
               store.hideDeleteListModal();
               store.loadIdNamePairs();
            }
        }
        asyncDeleteMarkedList()
    }
    store.hideDeleteListModal = function () {
        let modal = document.getElementById("delete-modal");
        modal.classList.remove("is-visible");
    }
    // THIS GIVES OUR STORE AND ITS REDUCER TO ANY COMPONENT THAT NEEDS IT
    return { store, storeReducer };
}