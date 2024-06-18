const mcName1 = "MATRIX"; // МК матрицы
const mcName2 = "Vector"; // МК ветором
const mcName3 = "Vector"; // МК приемник
const cubeLongId1 = 206000000002; // куб с матрицей
const cubeLongId2 = 207000000005; // куб с вектором
const cubeLongId3 = 207000000007; // куб с приемником

const pivotMonths = om.times // измерение в фильтрах
    .timePeriodTab("Months")
    .pivot()
    .columnsFilter("ms.MVP");
const pivotVersions = om.versions // измерение в фильтрах
    .versionsTab()
    .pivot()
    .columnsFilter("vs.Прогноз");
const getLabels = (pivot) => {
    const grid = pivot.create();
    const elements = [];
    const generator = grid.range().generator();
    for (const chunk of generator) {
        chunk
            .rows()
            .all()
            .forEach((label) => {
                if (
                    label.cells().first().getValue() === "true" &&
                    label.cells().first().isEditable()
                ) {
                    elements.push(label.first().longId());
                }
            });
    }
    return elements;
};

const getMonthsLabels = getLabels(pivotMonths);
const getVersionsLabels = getLabels(pivotVersions);
const countIterations = (arr1, arr2) =>
    arr1.flatMap((item1) => arr2.map((item2) => [item1, item2])); // все возможные комбинациииз двух измерений
const countIterationsArray = countIterations(
    getMonthsLabels,
    getVersionsLabels
); // находим комбинации, на выходе array
// console.log(countIterationsArray);
for (let iteration of countIterationsArray) {
    const [a, b] = iteration;
    multiplyMatrix(a, b);
    // console.log([a, b]);
} // запускаем multiply итерационно

//=== READ DATA ===
function getMatrix(mc, cube, filterMonths, filterVersions) {
    const pivotData = om.multicubes
        .multicubesTab()
        .open(mc)
        .pivot()
        .addDependentContext(cube)
        .addDependentContext(Number(filterVersions))
        .addDependentContext(Number(filterMonths));
    const gridData = pivotData.create();
    const generatorData = gridData.range().generator();
    let cells = [];
    for (const chunk of generatorData) {
        chunk
            .rows()
            .all()
            .forEach((label) => {
                const cellsGrid = label.cells().all();
                const cellsRow = cellsGrid.map((cell) => cell.getValue());
                cells.push(cellsRow);
            });
    }
    return cells;
}
function multiplyMatrix(monthId, versionId) {
    const cells = getMatrix(mcName1, cubeLongId1, monthId, versionId);
    const cells2 = getMatrix(mcName2, cubeLongId2, monthId, versionId);

    //=== USE SERVICE ===
    const http = om.connectors.http();
    const request = http.requestBuilder();
    request.url().setUrl(
        "https://am11.optimacros.com/app/8741c2d8-c2d7-4f9a-8dcc-281316bdda31/vectorMatrixBody" // хэндлер к которому обращаемся
    );
    request.setMethod("POST");
    request
        .body()
        .jsonBody()
        .setJson(JSON.stringify({ matrix: cells, matrix2: cells2 }));
    const response = request.send();
    //console.log(response.getStringDataLikeJson().flat());

    if (response.isOk()) {
        const data = response.getStringDataLikeJson(); // получаем расчет
        //console.log(data.flat());
        if (data.length) {
            const singleArray = data.flat();
            const pivot = om.multicubes
                .multicubesTab()
                .open(mcName3)
                .pivot()
                .addDependentContext(cubeLongId3)
                .addDependentContext(Number(versionId))
                .addDependentContext(Number(monthId));
            const grid = pivot.create();
            const generator = grid.range().generator();
            const cb = om.common.createCellBuffer().canLoadCellsValues(false);
            for (const chunk of generator) {
                chunk
                    .cells()
                    .all()
                    .forEach((label, index) => {
                        cb.set(label, Number(singleArray[index]));
                    });
            }
            //console.log([Number(monthId), Number(versionId)]);
            cb.apply();
        }
        console.log("Done!");
    } else {
        console.log("Service Error!");
    }
}
