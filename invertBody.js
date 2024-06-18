const math = require('./modules/math.js');

// console.log(math.inv([[1,0,4],[0,4,2],[0,2,1]]))


OM.web('invertBody', async (request) => {
    const matrix = request.body || [];
    try {
        return JSON.stringify(math.inv(matrix));
    } catch (e) {
        return JSON.stringify([]);
    }
});