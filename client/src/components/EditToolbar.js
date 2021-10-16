import { useContext } from 'react'
import { GlobalStoreContext } from '../store'
import { useHistory } from 'react-router-dom'
/*
    This toolbar is a functional React component that
    manages the undo/redo/close buttons.
    
    @author McKilla Gorilla
*/
function EditToolbar() {
    const { store } = useContext(GlobalStoreContext);
    const history = useHistory();

    function handleUndo() {
        store.undo();
    }
    function handleRedo() {
        store.redo();
    }
    function handleClose() {
        //console.log("CLOSE LIST BUTTON CLICKED")
        history.push("/");
        store.closeCurrentList();
    }

    //console.log("button bools", store.canUndo, store.canRedo, store.canCloseList)

    let canCloseListOnClick = null
    let canCloseListButtonClass = "top5-button-disabled"
    if (store.canCloseList) {
        canCloseListOnClick = handleClose
        canCloseListButtonClass = "top5-button"
    }

    let canUndoOnClick = null
    let canUndoButtonClass = "top5-button-disabled"
    if (store.canUndo) {
        canUndoOnClick = handleUndo
        canUndoButtonClass = "top5-button"
    }

    let canRedoOnClick = null
    let canRedoButtonClass = "top5-button-disabled"
    if (store.canRedo) {
        canRedoOnClick = handleRedo
        canRedoButtonClass = "top5-button"
    }

    return (
        <div id="edit-toolbar">
            <div
                id='undo-button'
                onClick={canUndoOnClick}
                className={canUndoButtonClass}>
                &#x21B6;
            </div>
            <div
                id='redo-button'
                onClick={canRedoOnClick}
                className={canRedoButtonClass}>
                &#x21B7;
            </div>
            <div
                id='close-button'
                onClick={canCloseListOnClick}
                className={canCloseListButtonClass}>
                &#x24E7;
            </div>
        </div>
    )
}
export default EditToolbar;