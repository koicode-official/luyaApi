var db = require("../db/db");
var common = require("../public/javascripts/common.js")

/**
 * where 생성 함수
 * @param {object} obj - { ... , 필드명 : 조건값 }
 * @returns {string} - " AND 필드명 = 필드값 ... " 
 */

const whereParsing = (obj) => {
    let parse = "WHERE 1=1 ";
    for (const [key, value] of Object.entries(obj)) {
        if (key === "NotWhere") {
            for (const [notKey, notValue] of Object.entries(value)) {
                if (notValue instanceof Date) {
                    const date = common.jsDateToMysqlDateTime(notValue);
                    parse += ` AND DATE_FORMAT(${notKey}, '%Y-%m-%d') != DATE_FORMAT('${date}', '%Y-%m-%d') `
                } else if (typeof notValue === "number") {
                    parse += ` AND ${notKey} != ${notValue}`
                } else if (notValue === null) {
                    parse += ` AND ${notKey} IS NOT NULL`
                } else {
                    parse += ` AND ${notKey} != "${notValue}" `
                }
            }
        } else {
            if (value instanceof Date) {
                const date = common.jsDateToMysqlDateTime(value);
                parse += ` AND DATE_FORMAT(${key}, '%Y-%m-%d') = DATE_FORMAT('${date}', '%Y-%m-%d') `
            } else if (typeof value === "number") {
                parse += ` AND ${key} = ${value}`
            } else if (value === null) {
                parse += ` AND ${key} IS NULL`
            } else {
                parse += ` AND ${key} = "${value}" `
            }
        }
    }
    return parse
}


/**
 * 단일 데이터 필드명, 필드값 리스트 생성 - InsertParsing()
 * @param {obejct} obj 
 * @returns {object} - { 필드리스트, 값리스트 }
 */
const InsertParsing = (obj) => {
    let fieldList = [];
    let valueList = [];
    for (const [key, value] of Object.entries(obj)) {
        fieldList.push(key);
        valueList.push(value)
    }
    return { fieldList: fieldList.join(','), valueList: valueList.join('", "') }
}

/**
 * 벌크 데이터 필드값 리스트 생성 - InsertBulkParsing()
 * @param {obejct} obj 
 * @returns {object} - { 필드리스트, 값리스트 }
 */
const InsertBulkParsing = (obj) => {
    let valueList = [];
    for (e of obj) {
        let values = [];
        for (const [key, value] of Object.entries(e)) {
            values.push(value)
        }
        valueList.push(values);
    }
    return valueList;
}
/**
 * 업데이트 값 생성 - updateParsing()
 * @param {obejct} obj 
 * @returns {object} - { 필드리스트, 값리스트 }
 */
const updateParsing = (obj) => {
    const valueList = [];
    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === "number") {
            valueList.push(`${key} = ${value}`)
        } else if (value === null) {
            valueList.push(`${key} = NULL`)
        } else {
            valueList.push(`${key} = '${value}'`)
        }
    }
    return valueList.join(',')
}


const crud = {

    /**
     * 테이블 데이터 조회
     * @param {array} fields - 단일 "필드명", 복수 [ ... , "필드명"]
     * @param {string} tableName - 테이블 이름
     * @param {obejct} wherePhrase - { ... , 필드명 : 조건값 }( 날짜는 new Date(date)로 할당 )
     * @returns {object}
     */
    getDataListFromTable: async (fields, tableName, wherePhrase, options = {}) => {
        const { orderby, groupby, limit, offset } = options;
        const fieldsList = fields.length === 0 ? '*' : typeof fields === "string" ? fields : fields.join(',');
        const query = `
            SELECT 
                ${fieldsList}
            FROM 
                ${tableName} tb
                ${wherePhrase ? whereParsing(wherePhrase) : ''}
                ${orderby ? 'ORDER BY ' + orderby : ''}
                ${groupby ? 'GROUP BY ' + groupby : ''}
                ${limit ? 'LIMIT ' + limit : ''}
                ${offset ? 'OFFSET ' + offset : ''}
        `;
        console.log(query);
        try {
            const [rows] = await db.query(query);
            return { status: 1, rows: rows };
        } catch (error) {
            console.error(`Error Occurred from getDataListFromTable() function : \r`, error.sqlMessage);
            return { status: -1, error: error.sqlMessage };
        }
    },

    // getDataListFromTable: async (fields, tableName, wherePhrase, orderby, groupby) => {
    //     const fieldsList = fields.length === 0 ? '*' : typeof fields === "string" ? fields : fields.join(',');
    //     const query =
    //         `SELECT 
    //             ${fieldsList}
    //         FROM 
    //             ${tableName} tb
    //             ${wherePhrase ? whereParsing(wherePhrase) : ''}
    //             ${orderby ? 'ORDER BY ' + orderby : ''}
    //             ${groupby ? 'GROUP BY ' + groupby : ''}
    //         `
    //         ;
    //     console.log( query)
    //     try {
    //         const [rows] = await db.query(query);
    //         return { status: 1, rows: rows }
    //     } catch (error) {
    //         console.error(`Error Occured from getDataListFromTable() function : \r`, error.sqlMessage)
    //         return { status: -1, error: error.sqlMessage }
    //     }
    // },

    /**
     * 데이터 생성 - createDataRow()
     * @param {string} tableName - 테이블 이름
     * @param {object} obj  - { ... , 필드명 : 필드값 }
     * @returns {object}
     */

    createDataRow: async (tableName, obj) => {
        const keys = Object.keys(obj);
        const values = Object.values(obj);
        const placeholders = keys.map(() => '?').join(',');

        const query = `INSERT INTO ${tableName} (${keys.join(',')}) VALUES (${placeholders})`;
        console.log('insert query', query, values);

        try {
            const [rows] = await db.query(query, values);
            return { status: 1, rows: rows }
        } catch (error) {
            console.error(`Error Occured from createDataRow() function : \r`, error.sqlMessage);
            return { status: -1, error: error.sqlMessage };
        }
    },

    //   구버전
    // createDataRow: async (tableName, obj) => {
    //     const insertData = InsertParsing(obj);
    //     const query = `INSERT INTO ${tableName}(${insertData.fieldList}) VALUES ("${insertData.valueList}")`;
    //     console.log('insert query', query)
    //     try {
    //         const [rows] = await db.query(query, insertData.valueList);
    //         return { status: 1, rows: rows }
    //     } catch (error) {
    //         console.error(`Error Occured from createDataRow() function : \r`, error.sqlMessage)
    //         return { status: -1, error: error.sqlMessage }
    //     }
    // },


    /**
     * 데이터 벌크 생성 - createDataRowBulk()
     * @param {string} tableName 
     * @param {object} obj 
     * @returns 
     */

    createDataRowBulk: async (tableName, obj) => {
        const fieldList = Object.keys(obj[0]).join(',');
        const placeholders = obj.map(row => '(' + Object.values(row).fill('?').join(',') + ')').join(',');
        const values = obj.reduce((acc, row) => acc.concat(Object.values(row)), []);

        const query = `INSERT INTO ${tableName}(${fieldList}) VALUES ${placeholders}`;
        try {
            const [rows] = await db.query(query, values, true);
            return { status: 1, rows: rows }
        } catch (error) {
            console.error(`Error Occured from createDataRowBulk() function : \r`, error.sqlMessage);
            return { status: -1, error: error.sqlMessage };
        }
    },

    // 구버전
    // createDataRowBulk: async (tableName, obj) => {
    //     const valueList = InsertBulkParsing(obj);
    //     const fieldList = Object.keys(obj[0]);
    //     const query = `INSERT INTO ${tableName}(${fieldList}) VALUES ?`;
    //     try {
    //         const [rows] = await db.query(query, [valueList], true);
    //         return { status: 1, rows: rows }
    //     } catch (error) {
    //         console.error(`Error Occured from createDataRowBulk() function : \r`, error.sqlMessage)
    //         return { status: -1, error: error.sqlMessage }
    //     }
    // },

    /**
     * 데이터 업데이트 - updateData()
     * @param {string} tableName 
     * @param {object} obj 
     * @param {object} wherePhrase 
     * @returns 
     */
    updateData: async (tableName, obj, wherePhrase) => {
        if (wherePhrase.length === 0) {
            console.error(`Error Occured from updateData() function : wherePhrase is not defined`)
            return { status: -1, error: error.sqlMessage }
        }
        const valueList = updateParsing(obj);
        const query = `
        UPDATE ${tableName}
        SET 
            ${valueList}
            ${wherePhrase ? whereParsing(wherePhrase) : ''}`
        try {
            console.log('update query :>> ', query);
            const [rows] = await db.query(query);
            return { status: 1, rows: rows }
        } catch (error) {
            console.error(`Error Occured from updateData() function : \r`, error.sqlMessage)
            return { status: -1, error: error.sqlMessage }
        }
    },

    /**
    * 데이터 삭제 - deleteData()
    * @param {string} tableName 
    * @param {object} obj 
    * @param {object} wherePhrase 
    * @returns 
    */
    deleteData: async (tableName, wherePhrase) => {
        if (wherePhrase.length === 0) {
            console.error(`Error Occured from deleteData() function : wherePhrase is not defined`)
            return { status: -1, error: error.sqlMessage }
        }
        const query = `
        DELETE FROM 
            ${tableName}
            ${wherePhrase ? whereParsing(wherePhrase) : ''}`
        try {
            const [rows] = await db.query(query);
            return { status: 1, rows: rows }
        } catch (error) {
            console.log('error', error)
            console.error(`Error Occured from updateData() function : \r`, error.sqlMessage)
            return { status: -1, error: error.sqlMessage }
        }
    },
    getMaxOfField: async (field, tableName, wherePhrase) => {
        if (field.length === 0) {
            console.error(`Error Occured from deleteData() function : field is not defined`)
            return { status: -1, error: error.sqlMessage }
        }
        if (wherePhrase.length === 0) {
            console.error(`Error Occured from deleteData() function : wherePhrase is not defined`)
            return { status: -1, error: error.sqlMessage }
        }
        const query = `

        SELECT 
            * 
        FROM ${tableName} 
            ${wherePhrase ? whereParsing(wherePhrase) : ''} 
            AND 
                ${field} = (SELECT MAX(${field}) FROM ${tableName} ${wherePhrase ? whereParsing(wherePhrase) : ''} );
            `
        console.log('query', query)
        try {

            const [rows] = await db.query(query);
            return { status: 1, rows: rows }
        } catch (error) {
            console.error(`Error Occured from getMaxOfField() function : \r`, error.sqlMessage)
            return { status: -1, error: error.sqlMessage }
        }
    }
}

module.exports = crud