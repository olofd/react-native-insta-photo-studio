export default class ColumnSplitter {

    static appendToState(dataSource, newAssets, imagesPerRow) {
        let columnsAdded = 0;
        const lastRow = dataSource[dataSource.length - 1];
        if (lastRow && lastRow.rowData.length < imagesPerRow) {
            for (let i = (lastRow.rowData.length); i < imagesPerRow; i++) {
                lastRow.rowData.push(newAssets[columnsAdded]);
                columnsAdded++;
            }
            lastRow.rowData = [...lastRow.rowData];
        }
        const previousLength = (dataSource && dataSource.length) || 0;
        const newRows = newAssets.filter((item, index) => index >= columnsAdded).reduce((newRows, image, index) => {
            if (index % imagesPerRow == 0 && index !== 0) {
                newRows.push({
                    rowKey: newRows.length + previousLength,
                    rowData: []
                });
            };
            newRows[newRows.length - 1].rowData.push(image);
            return newRows;
        }, [{
            rowKey: previousLength,
            rowData: []
        }]);
        return dataSource.concat(newRows);
    }

    static markRowsForRerender(dataSource, imageUris, newSelection) {
        let newSelectionRow = -1;
        let rowsToRerender = [];
        for (var i = 0; i < dataSource.length; i++) {
            const row = dataSource[i];
            let uriFound = '';
            for (var j = 0; j < row.rowData.length; j++) {
                const item = row.rowData[j];
                uriFound = imageUris.find(uri => item.uri === uri);
                if (uriFound) {
                    break;
                }
                if (newSelectionRow === -1) {
                    const selectionFoundInRow = item.uri === newSelection.uri;
                    if (selectionFoundInRow) {
                        newSelectionRow = i;
                    }
                }
            }

            if (uriFound) {
                imageUris = imageUris.filter(uri => uri !== uriFound);
                dataSource[i].rowData = [...dataSource[i].rowData];
            }

            if (imageUris.length === 0) {
                break;
            }
        }
        return newSelectionRow;
    }

    markRowForRerender(dataSource, rowIndex) {}
}