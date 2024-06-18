const mcName = "MATRIX";
const cubeLongIdOutput = 206000000002;
const cubeLongIdInput = 206000000003;
//=== READ DATA ===
const pivotMonths = om.times
    .timePeriodTab("Months")
    .pivot()
    .columnsFilter("ms.MVP");
const pivotVersions = om.versions
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
    arr1.flatMap((item1) => arr2.map((item2) => [item1, item2]));
const countIterationsArray = countIterations(
    getMonthsLabels,
    getVersionsLabels
);
// console.log(countIterationsArray);
for (let iteration of countIterationsArray) {
    const [a, b] = iteration;
    getMatrix(a, b);
}

function getMatrix(filterMonths, filterVersions) {
    //=== READ DATA ===//
    const pivotData = om.multicubes
        .multicubesTab()
        .open(mcName)
        .pivot()
        .addDependentContext(cubeLongIdOutput)
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
    //=== USE SERVICE ===//
    const http = om.connectors.http();
    const request = http.requestBuilder();
    request
        .url()
        .setUrl(
            "https://am11.optimacros.com/app/8741c2d8-c2d7-4f9a-8dcc-281316bdda31/invertBody"
        );
    request.setMethod("POST");
    request.body().jsonBody().setJson(JSON.stringify(cells));
    const response = request.send();
    //console.log(response.getStringDataLikeJson());

    if (response.isOk()) {
        const data = response.getStringDataLikeJson();
        if (data.length) {
            const singleArray = data.flat();
            const pivot = om.multicubes
                .multicubesTab()
                .open(mcName)
                .pivot()
                .addDependentContext(cubeLongIdInput)
                .addDependentContext(Number(filterVersions))
                .addDependentContext(Number(filterMonths));
            const grid = pivot.create();
            const generator = grid.range().generator();
            const cb = om.common.createCellBuffer().canLoadCellsValues(false);
            for (const chunk of generator) {
                chunk
                    .cells()
                    .all()
                    .forEach((label, index) => {
                        cb.set(label, Number(singleArray[index]) || "");
                    });
            }
            cb.apply();
        }
        console.log("Done!");
    } else {
        console.log("Service Error!");
    }
}
