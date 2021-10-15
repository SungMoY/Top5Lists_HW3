import { React, useContext, useEffect, useState } from "react";
import { useHistory } from "react-router";
import { GlobalStoreContext } from '../store'
/*
    This React component represents a single item in our
    Top 5 List, which can be edited or moved around.
    
    @author McKilla Gorilla
*/
function Top5Item(props) {
    const { store } = useContext(GlobalStoreContext);
    const [draggedTo, setDraggedTo] = useState(0);
    const [itemEditActive, setItemEditActive] = useState(false);
    const [ text, setText ] = useState("");
    store.history=useHistory();

    //let {id, key, text, index} = props

    function handleDragStart(event) {
        event.dataTransfer.setData("item", event.target.id);
    }

    function handleDragOver(event) {
        event.preventDefault();
    }

    function handleDragEnter(event) {
        event.preventDefault();
        setDraggedTo(true);
    }

    function handleDragLeave(event) {
        event.preventDefault();
        setDraggedTo(false);
    }

    function handleDrop(event) {
        event.preventDefault();
        let target = event.target;
        let targetId = target.id;
        targetId = targetId.substring(target.id.indexOf("-") + 1);
        let sourceId = event.dataTransfer.getData("item");
        sourceId = sourceId.substring(sourceId.indexOf("-") + 1);
        setDraggedTo(false);

        // UPDATE THE LIST
        store.addMoveItemTransaction(sourceId, targetId);
    }

    function handleToggleEdit(event) {
        event.stopPropagation();
        console.log("EDIT TOGGLED")
        toggleEdit();
    }

    function toggleEdit() {
        let newActive = !itemEditActive;
        if (newActive) {
            setText(props.text)
            store.setIsItemEditActive();
        }
        setItemEditActive(newActive);
    }

    function handleKeyPress(event) {
        if (event.code === "Enter") {
            handleBlur();
        }
    }

    let { index } = props;

    function handleBlur(event) {
        console.log("EDITING FINISHED, PASSING THESE ON", props.index, text, props.text)
        let oldText = props.text
        if (text !== oldText) {
            console.log("NEW TEXT IS UNIQUE SO SHOULD BE UPDATED")
            if (text === "") {
                console.log("QUESTION MARK TRANSACTION")
                store.addUpdateItemTransaction(props.index, "?", oldText);
            } else {
                console.log("REGULAR TRANSACTION")
                store.addUpdateItemTransaction(props.index, text, oldText);
            }
        } else {
            console.log("NEW TEXT IS NOT UNIQUE ")
        }
        toggleEdit();
    }

    function handleUpdateText(event) {
        setText(event.target.value);
    }

    //console.log("item STORE",store.isItemEditActive)
    //console.log("item STATE",itemEditActive)

    let itemClass = "top5-item";
    if (draggedTo) {
        itemClass = "top5-item-dragged-to";
    }
    let itemStatus = false;
    if (store.isItemEditActive) {
        itemStatus = true;
    }
    /*
    if (itemEditActive) {
        console.log("edit active for this prop", props)
    }
    */
    let itemElement = 
        <div
            id={'item-' + (index + 1)}
            className={itemClass}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            draggable="true"
        >
            <input
                type="button"
                id={"edit-item-" + index + 1}
                className="list-card-button"
                onClick={handleToggleEdit}
                value={"\u270E"}
            />
            {props.text}
        </div>;
    if (itemEditActive) {
        itemElement =
        <input
            id={'item-' + (index + 1)}
            className={itemClass}
            type='text'
            autoFocus={true}
            onKeyPress={handleKeyPress}
            onBlur={handleBlur}
            onChange={handleUpdateText}
            defaultValue={props.text}

        />
    }
    return (itemElement);
}

export default Top5Item;