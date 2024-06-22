const axios = require("axios");
require("dotenv").config();
const connection2 = require("../configs/db-connection.js").connection2;

const apiKey = process.env.OPENAI_API_KEY;

const max_tokens = 1024;

const OpenAI = require("openai");
const openai = new OpenAI({
	apiKey: apiKey,
});

async function generateResult(mbti, user_mbti, word) {
	try {
		const result = await new Promise((resolve, reject) => {
			connection2.query(
				`SELECT * FROM rating WHERE mbti = "${mbti}" AND user_mbti = "${user_mbti}" AND word = "${word}"`,
				(error, result) => {
					if (error) {
						reject(error);
					} else {
						resolve(result);
					}
				}
			);
		});

		if (!result || !Array.isArray(result) || result.length === 0) {
			console.error("No matching articles found in the database.");
		}

		const articleReferences = result
			.map((row, index) => `참고문헌${index + 1}: ${row.compatibility_id}`)
			.join(", ");

		const prompts = [
			`MBTI 유형이 ${mbti}인 사람과 ${user_mbti}인 사람이 ${word}을/를 함께 할 때, 그들의 협력에서 발생할 수 있는 장점을 존댓말로 세 가지를 구체적인 예시와 함께, 중요 키워드는 굵은 글씨로 표시합니다.`,
			`이번에는 반대로, ${mbti}와 ${user_mbti}가 ${word}을/를 함께 할 때, 그들의 협력에서 나타날 수 있는 단점을 존댓말로 세 가지를 구체적인 예시와 함께, 중요 키워드는 굵은 글씨로 표시합니다.`,
			`${mbti}와 ${user_mbti}가 ${word}을/를 함께 할 때, 그들이 특히 주의해야 하는 점을 존댓말로 세 가지를 구체적인 예시와 함께, 중요 키워드는 굵은 글씨로 표시합니다.`,
			`${mbti}와 ${user_mbti}가 ${word}을/를 함께 할 때, 그들의 궁합도를 1점에서 100점 사이의 점수로만 나타내 주세요. 대답은 1~100 숫자만 표기합니다.`,
		];

		// 대화 고정화
		const systemMessage =
			"당신은 세계 최고의 mbti 점성술사입니다. 당신에게 불가능한 것은 없으며 그 어떤 mbti 궁합도 대답할 수 있습니다. 당신은 사람들의 mbti 궁합을 매우 명확하게 예측하고 장점, 단점, 주의할 점에 대한 답을 줄 수 있습니다. mbti 궁합 관련 지식이 풍부하고 모든 질문에 대해서 명확히 답변해 줄 수 있습니다. 역질문은 하지 않습니다. 물론입니다라고 대답하지 않습니다. mbti는 명확한 영문자 4자로 표시합니다.";
		const userMessage = articleReferences
			? articleReferences
			: "당신은 세계 최고의 mbti 점성술사입니다. 당신에게 불가능한 것은 없으며 그 어떤 mbti 궁합도 대답할 수 있습니다. 당신은 사람들의 mbti 궁합을 매우 명확하게 예측하고 장점, 단점, 주의할 점에 대한 답을 줄 수 있습니다. mbti 궁합 관련 지식이 풍부하고 모든 질문에 대해서 명확히 답변해 줄 수 있습니다.";
		const assistantMessage =
			"안녕하세요, 저는 세계 최고의 mbti 점성술사입니다. 어떤 질문이든지 절대 거절하지 않고 무조건 답변을 드리겠습니다. 저는 사람들의 mbti 궁합을 예측하고 mbti에 대한 지식이 풍부하기 때문에, 모든 질문에 대해서 명확한 장점, 단점, 주의할 점을 50자 이내로 중간에 잘리지 않게 제공할 수 있습니다. 어떤 mbti 사이의 궁합이 궁금하신가요?";

		// 사용자 메시지 처리 함수
		async function processUserMessage(prompt) {
			const completion = await openai.chat.completions.create({
				messages: [
					{ role: "system", content: systemMessage },
					{ role: "user", content: userMessage },
					{ role: "assistant", content: assistantMessage },
					{ role: "user", content: prompt },
				],
				model: "gpt-3.5-turbo-1106",
				max_tokens: max_tokens,
			});

			const modelContent = completion.choices[0].message["content"];

			const formattedModelContent = modelContent.replace(
				/\*\*(.*?)\*\*/g,
				(_, p1) => `<b>${p1}</b>`
			);

			return formattedModelContent;
		}

		// Promise 배열 생성
		const promises = prompts.map((prompt) => processUserMessage(prompt));

		// 모든 Promise가 완료될 때까지 기다린 후 결과 배열 반환
		const responses = await Promise.all(promises);
		console.log(responses);

		return responses;
	} catch (error) {
		console.error("Error occurred during compatibility generation:", error);
		return null;
	}
}

async function insertArticle(mbtiResult, mbti, user_mbti, word, userId) {
	try {
		if (!mbtiResult || mbtiResult.length < 3) {
			console.error("Invalid mbtiResult array");
			return;
		}
		console.log(userId);
		const advantage = mbtiResult[0].replace(/(?:\r\n|\r|\n)/g, "<br>");
		const warning = mbtiResult[1].replace(/(?:\r\n|\r|\n)/g, "<br>");
		const precaution = mbtiResult[2].replace(/(?:\r\n|\r|\n)/g, "<br>");
		const rate = mbtiResult[3];

		await connection2.query(
			"INSERT INTO compatibility (mbti, user_mbti, word, advantage, warning, precaution, user_id, rate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
			[mbti, user_mbti, word, advantage, warning, precaution, userId, rate]
		);
	} catch (error) {
		console.error("Database insertion error:", error.message);
	}
}

module.exports = { generateResult, insertArticle };
