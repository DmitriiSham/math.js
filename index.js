const math = require('./modules/math.js');

// console.log(math.inv([[1,0,4],[0,4,2],[0,2,1]]))


OM.web('invert', async (request) => {
    const { query } = request;
    const { matrix } = query || { matrix: '%5B%5D' };

    try {
        const matrixArray = JSON.parse(decodeURIComponent(matrix));
        return JSON.stringify(math.inv(matrixArray));
    } catch (e) {
        return JSON.stringify([]);
    }
});