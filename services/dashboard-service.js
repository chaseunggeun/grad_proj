const connection = require("../configs/db-connection.js").connection;
const connection2 = require("../configs/db-connection.js").connection2;
const paginator_util = require("../utils/paginator.js");

const perPage = 15;

async function getUsersList(page) {
	const offset = (page - 1) * perPage;
	try {
		const [rows, totalCountRows] = await Promise.all([
			new Promise((resolve, reject) => {
				connection.query(
					`select * from users order by user_id desc limit ${offset}, ${perPage}`,
					(error, rows) => {
						if (error) {
							reject(error);
						} else {
							resolve(rows);
						}
					}
				);
			}),
			new Promise((resolve, reject) => {
				connection.query(
					"select count(*) as totalCount from users",
					(error, rows) => {
						if (error) {
							reject(error);
						} else {
							resolve(rows[0].totalCount);
						}
					}
				);
			}),
		]);

		const paginator = paginator_util.createPaginator(
			totalCountRows,
			page,
			perPage
		);

		return { rows, paginator };
	} catch (error) {
		console.log("getUserList error: ", error.message);
	}
}

async function getUser(user_id) {
	try {
		await connection.query(
			`select * from users where user_id = ${user_id}`,
			(error, row) => {
				return row;
			}
		);
	} catch (error) {
		console.log(error);
	}
}

async function deleteUser(user_id) {
	try {
		await connection.query(`delete from users where user_id in (${user_id})`);
	} catch (error) {
		console.log(error);
	}
}

async function getCompatibilityList(page) {
	const offset = (page - 1) * perPage;
	try {
		const [rows, totalCountRows] = await Promise.all([
			new Promise((resolve, reject) => {
				connection.query(
					`select * from compatibility order by compatibility_id desc limit ${offset}, ${perPage}`,
					(error, rows) => {
						if (error) {
							reject(error);
						} else {
							resolve(rows);
						}
					}
				);
			}),
			new Promise((resolve, reject) => {
				connection.query(
					"select count(*) as totalCount from compatibility",
					(error, rows) => {
						if (error) {
							reject(error);
						} else {
							resolve(rows[0].totalCount);
						}
					}
				);
			}),
		]);

		const paginator = paginator_util.createPaginator(
			totalCountRows,
			page,
			perPage
		);

		return { rows, paginator };
	} catch (error) {
		console.log("getCompatibilityList error: ", error.message);
	}
}

async function getCompatibility(compatibility_id) {
	try {
		await connection.query(
			`select * from compatibility where compatibility_id = ${compatibility_id}`,
			(error, row) => {
				return row;
			}
		);
	} catch (error) {
		console.log(error);
	}
}

async function deleteCompatibility(compatibility_id) {
	try {
		await connection.query(
			`delete from compatibility where comptibility_id in (${compatibility_id})`
		);
	} catch (error) {
		console.log(error);
	}
}

async function getCategoryList(page) {
	const offset = (page - 1) * perPage;
	try {
		const [rows, totalCountRows] = await Promise.all([
			new Promise((resolve, reject) => {
				connection.query(
					`select * from category order by category_id desc limit ${offset}, ${perPage}`,
					(error, rows) => {
						if (error) {
							reject(error);
						} else {
							resolve(rows);
						}
					}
				);
			}),
			new Promise((resolve, reject) => {
				connection.query(
					"select count(*) as totalCount from category",
					(error, rows) => {
						if (error) {
							reject(error);
						} else {
							resolve(rows[0].totalCount);
						}
					}
				);
			}),
		]);

		const paginator = paginator_util.createPaginator(
			totalCountRows,
			page,
			perPage
		);

		return { rows, paginator };
	} catch (error) {
		console.log("getCategoryList error:", error.message);
	}
}

async function getCategory(category_name) {
	try {
		await connection2.query(
			`select * from category where category_name = "${category_name}"`,
			(error, row) => {
				console.log("category row:", row);
				return row;
			}
		);
	} catch (error) {
		console.log(error);
	}
}

async function deleteCategory(category_id) {
	try {
		await connection2.query(
			`delete from category where category_id in (${category_id})`
		);
	} catch (error) {
		console.log(error);
	}
}

async function insertCategory(category_name) {
	try {
		await connection2.query(`insert into category set ?`, {
			category_name: category_name,
		});
	} catch (error) {
		console.log(error);
	}
}

async function getOpenkakaoList(page) {
	const offset = (page - 1) * perPage;
	try {
		const [rows, totalCountRows] = await Promise.all([
			new Promise((resolve, reject) => {
				connection.query(
					`select * from openkakao order by openkakao_id desc limit ${offset}, ${perPage}`,
					(error, rows) => {
						if (error) {
							reject(error);
						} else {
							resolve(rows);
						}
					}
				);
			}),
			new Promise((resolve, reject) => {
				connection.query(
					"select count(*) as totalCount from openkakao",
					(error, rows) => {
						if (error) {
							reject(error);
						} else {
							resolve(rows[0].totalCount);
						}
					}
				);
			}),
		]);

		const paginator = paginator_util.createPaginator(
			totalCountRows,
			page,
			perPage
		);

		return { rows, paginator };
	} catch (error) {
		console.log("getOpenkakaoList error: ", error.message);
	}
}

async function getOpenkakao(openkakao_id) {
	try {
		await connection.query(
			`select * from openkakao where openkakao_id = ${openkakao_id}`,
			(error, row) => {
				return row;
			}
		);
	} catch (error) {
		console.log(error);
	}
}

async function deleteOpenkakao(openkakao_id) {
	try {
		await connection.query(
			`delete from openkakao where openkakao_id in (${openkakao_id})`
		);
	} catch (error) {
		console.log(error);
	}
}

async function getRatingList(page) {
	const offset = (page - 1) * perPage;
	try {
		const [rows, totalCountRows] = await Promise.all([
			new Promise((resolve, reject) => {
				connection.query(
					`select * from rating order by compatibility_id desc limit ${offset}, ${perPage}`,
					(error, rows) => {
						if (error) {
							reject(error);
						} else {
							resolve(rows);
						}
					}
				);
			}),
			new Promise((resolve, reject) => {
				connection.query(
					"select count(*) as totalCount from rating",
					(error, rows) => {
						if (error) {
							reject(error);
						} else {
							resolve(rows[0].totalCount);
						}
					}
				);
			}),
		]);

		const paginator = paginator_util.createPaginator(
			totalCountRows,
			page,
			perPage
		);

		return { rows, paginator };
	} catch (error) {
		console.log("getTopList error:", error.message);
	}
}

async function getRating(compatibility_id) {
	try {
		await connection.query(
			`select * from rating where compatibility_id = ${compatibility_id}`,
			(error, row) => {
				return row;
			}
		);
	} catch (error) {
		console.log(error);
	}
}

async function deleteRating(compatibility_id) {
	try {
		await connection.query(
			`delete from rating where compatibility_id in (${compatibility_id})`
		);
	} catch (error) {
		console.log(error);
	}
}

module.exports = {
	getUsersList,
	getUser,
	deleteUser,
	getCompatibilityList,
	getCompatibility,
	deleteCompatibility,
	getCategoryList,
	getCategory,
	deleteCategory,
	insertCategory,
	getOpenkakaoList,
	getOpenkakao,
	deleteOpenkakao,
	getRatingList,
	getRating,
	deleteRating,
};
