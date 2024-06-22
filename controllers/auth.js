const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { promisify } = require("util");
const { decode } = require("punycode");
const gpt_service = require("../services/gpt-service.js");
const connection = require("../configs/db-connection.js").connection;
const connection2 = require("../configs/db-connection.js").connection2;
const paginator_util = require("../utils/paginator.js");

exports.login = async (req, res) => {
  try {
    const { id, password } = req.body;

    if (!id || !password) {
      return res.status(400).render("login", {
        message: "Please provide an id and password",
      });
    }

    connection.query(
      "SELECT * FROM users WHERE id = ?",
      [id],
      async (error, result) => {
        console.log(result);
        if (
          !result ||
          result.length === 0 ||
          !(await bcrypt.compare(password, result[0].password))
        ) {
          res.status(401).render("login", {
            message: "아이디 혹은 비밀번호가 정확하지 않습니다.",
          });
        } else {
          const user_id = result[0].user_id;

          const token = jwt.sign({ user_id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN,
          });

          const cookieOptions = {
            expires: new Date(
              Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
            ),
            httpOnly: true,
          };

          res.cookie("jwt", token, cookieOptions);
          res.status(200).redirect("/");
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};

exports.register = (req, res) => {
  console.log(req.body);

  const { name, id, password, passwordConfirm, mbti, age, sex } = req.body;

  connection.query(
    "SELECT id FROM users WHERE id = ?",
    [id],
    async (error, result) => {
      if (error) {
        console.log(error);
      }

      if (result.length > 0) {
        return res.render("register", {
          message: "That id is already in use",
        });
      } else if (password !== passwordConfirm) {
        return res.render("register", {
          message: "Passwords  do not match",
        });
      }

      let hashedPassword = await bcrypt.hash(password, 8);
      console.log(hashedPassword);

      connection.query(
        "INSERT INTO users SET ?",
        {
          name: name,
          id: id,
          password: hashedPassword,
          mbti: mbti,
          age: age,
          sex: sex,
        },
        (error, result) => {
          if (error) {
            console.log(error);
          } else {
            console.log(result);
            return res.render("index", {
              message: "User registered",
            });
          }
        }
      );
    }
  );
};

exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 토큰 검증
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );
      console.log(decoded.id);
      // 사용자가 존재하는지 확인
      connection.query(
        "SELECT * FROM users WHERE user_id = ?",
        [decoded.user_id],
        (error, result) => {
          if (!result || result.length === 0) {
            console.log(req.cookies.jwt);
            return next();
          }
          req.user = result[0];
          return next();
        }
      );
    } catch (error) {
      console.log(error);
      return next();
    }
  } else {
    next();
  }
};

exports.logout = async (req, res) => {
  res.cookie("jwt", "logout", {
    expires: new Date(Date.now() + 2 * 1000),
    httpOnly: true,
  });

  res.status(200).redirect("/");
};

exports.generate = async (req, res) => {
  let decoded;
  try {
    if (req.cookies.jwt) {
      decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );
    }
    if (!decoded) {
      return res.status(401).send("Unauthorized");
    }
    console.log(decoded.user_id);
    const { mbti, user_mbti, word } = req.body;
    console.log("generate");
    const mbtiResult = await gpt_service.generateResult(mbti, user_mbti, word);

    if (!mbtiResult || mbtiResult.length < 3) {
      console.log("결과를 생성할 수 없습니다.");
      return;
    }

    try {
      await gpt_service.insertArticle(
        mbtiResult,
        mbti,
        user_mbti,
        word,
        decoded.user_id
      );
    } catch (error) {
      console.error("data insert error:", error.message);
    }
  } catch (error) {
    console.error("생성 중 오류 발생:", error.message);
  }
  setTimeout(() => {
    return res.redirect("/result");
  }, 500);
};

exports.getOpenkakaoList2 = async (page, mbti) => {
  try {
    const perPage = 5;
    const offset = (page - 1) * perPage;

    console.log("mbti: ", mbti);

    const [rows, totalCountRows] = await Promise.all([
      new Promise((resolve, reject) => {
        connection.query(
          `select * from openkakao where mbti like "%${mbti}%" order by openkakao_id desc limit ${offset}, ${perPage}`,
          (error, rows) => {
            if (error) {
              reject(error);
            } else {
              resolve(rows);
              console.log(
                `select * from openkakao where mbti like "%${mbti}%" order by openkakao_id desc limit ${offset}, ${perPage}`
              );
            }
          }
        );
      }),
      new Promise((resolve, reject) => {
        connection.query(
          `SELECT COUNT(*) AS totalCount FROM gpti.openkakao where mbti like "%${mbti}%"`,
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
    console.log("paginator: ", paginator);

    return { rows, paginator };
  } catch (error) {
    console.log("getKakaoList2 error: ", error.message);
  }
};

exports.addOpenkakaoData = function (data) {
  return new Promise((resolve, reject) => {
    var sql = `INSERT INTO openkakao SET ?`;
    connection.query(sql, data, function (err, results) {
      if (err) reject(err);
      resolve(results);
    });
  });
};

exports.addOpenkakaoData = function (data) {
  return new Promise((resolve, reject) => {
    var sql = `INSERT INTO openkakao SET ?`;
    connection.query(sql, data, function (err, results) {
      if (err) reject(err);
      resolve(results);
    });
  });
};

exports.getUserDataByUserId = function (user_id) {
  return new Promise((resolve, reject) => {
    var sql = `SELECT * FROM compatibility WHERE user_id = ? ORDER BY compatibility_id DESC LIMIT 1`;
    connection.query(sql, [user_id], function (err, results) {
      if (err) reject(err);
      resolve(results);
    });
  });
};

exports.score = async (req, res) => {
  let decoded;
  const { score } = req.body;
  if (req.cookies.jwt) {
    decoded = await promisify(jwt.verify)(
      req.cookies.jwt,
      process.env.JWT_SECRET
    );
  }
  console.log(score);
  if (score == null || isNaN(score) || !decoded || !decoded.user_id) {
    console.error("Invalid score or user_id");
    return res.status(400).send("Invalid score or user_id");
  }

  const sql = `
    UPDATE compatibility
    SET score = ?
    WHERE compatibility_id = (
      SELECT compatibility_id
      FROM (
        SELECT compatibility_id
        FROM compatibility
        WHERE user_id = ?
        ORDER BY compatibility_id DESC
        LIMIT 1
      ) tmp
    )
  `;

  connection2.query(
    sql,
    [score, decoded.user_id],
    function (error, results, fields) {
      if (error) {
        console.log(score);
        console.error("Database update error:", error.message);
        return res.status(500).send("Database update error");
      }

      const getCompatibilityIdSql = `
      SELECT compatibility_id
      FROM compatibility
      WHERE user_id = ?
      ORDER BY compatibility_id DESC
      LIMIT 1
    `;

      connection2.query(
        getCompatibilityIdSql,
        [decoded.user_id],
        function (getIdError, getIdResults, getIdFields) {
          if (getIdError) {
            console.error("Database get ID error:", getIdError.message);
            return res.status(500).send("Database get ID error");
          }

          if (score == 4 || score == 5) {
            const copySql = `
          INSERT INTO rating
          SELECT * FROM compatibility
          WHERE compatibility_id = ? ON DUPLICATE KEY UPDATE 
		  score = VALUES(score),
		  user_id = VALUES(user_id),
		  compatibility_id = VALUES(compatibility_id);
        `;

            connection2.query(
              copySql,
              [getIdResults[0].compatibility_id],
              function (copyError, copyResults, copyFields) {
                if (copyError) {
                  console.error("Database copy error:", copyError.message);
                  return res.status(500).send("Database copy error");
                }
              }
            );
          }
        }
      );

      res.redirect("/openkakao");
    }
  );
};

exports.updateProfile = async (req, res) => {
  const { name, mbti, age, sex } = req.body;

  connection.query(
    "UPDATE users SET name = ?, mbti = ?, age = ?, sex = ? WHERE user_id = ?",
    [name, mbti, age, sex, req.user.user_id],
    (error, results) => {
      if (error) {
        console.log(error);
        return res.status(500).send("Database update error");
      }

      res.status(200).redirect("/profile");
    }
  );
};

exports.getCategoryList = (async) => {
  return new Promise((resolve, reject) => {
    connection.query("SELECT * FROM category", (error, rows) => {
      if (error) {
        reject("getCategoryList error");
      } else {
        resolve(rows);
      }
    });
  });
};
