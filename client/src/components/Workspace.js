import { useContext, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import Top5Item from './Top5Item.js'
import { GlobalStoreContext } from '../store'
/*
    This React component lets us edit a loaded list, which only
    happens when we are on the proper route.
    
    @author McKilla Gorilla
*/
function Workspace() {
    const { store } = useContext(GlobalStoreContext);
    store.history = useHistory();


    let url = window.location.href;
    let page = url.substring(url.lastIndexOf('/') + 1);

    useEffect(() => {
        store.setCurrentList(page);
    }, []);

    //console.log("IN WORKSPACE", store.currentList.items)


    let editItems = "";
    if (store.currentList) {
        editItems = 
            <div id="edit-items">
                {
                    store.currentList.items.map((item, index) => (
                        <Top5Item 
                            id={'top5-item-' + (index+1)}
                            key={'top5-item-' + (index+1)}
                            text={item}
                            index={index} 
                        />
                    ))
                }
            </div>;
    }
    return (
        <div id="top5-workspace">
            <div id="workspace-edit">
                <div id="edit-numbering">
                    <div className="item-number">1.</div>
                    <div className="item-number">2.</div>
                    <div className="item-number">3.</div>
                    <div className="item-number">4.</div>
                    <div className="item-number">5.</div>
                </div>
                {editItems}
            </div>
        </div>
    )
}

export default Workspace;