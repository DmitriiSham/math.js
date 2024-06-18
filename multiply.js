const math = require('./modules/math.js');

// console.log(math.inv([[1,0,4],[0,4,2],[0,2,1]]))


OM.web('multiply', async (request) => {
    const { query } = request;
    const { matrix, matrix2 } = query || { matrix: '%5B%5D', matrix2: '%5B%5D' };

    try {
        const matrix1parse = JSON.parse(decodeURIComponent(matrix));
        const matrix2parse = JSON.parse(decodeURIComponent(matrix2));
        // const invertMatrix = math.inv(matrix1parse)
        const matrixMultiply = math.multiply(matrix1parse,matrix2parse)
        return JSON.stringify(matrixMultiply);
    } catch (e) {
        return JSON.stringify([]);
    }
});