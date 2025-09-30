const faunadb = require("faunadb");
const q = faunadb.query;

exports.handler = async (event, context) => {
  try {
    const user = context.clientContext && context.clientContext.user;
    if (!user || user.email.toLowerCase() !== "dbaltovick@gmail.com") {
      return { statusCode: 403, body: JSON.stringify({ error: "Unauthorized" }) };
    }
    const FAUNA_SECRET = process.env.FAUNA_SECRET;
    if (!FAUNA_SECRET) {
      return { statusCode: 500, body: JSON.stringify({ error: "FAUNA_SECRET not set" }) };
    }
    const client = new faunadb.Client({ secret: FAUNA_SECRET });
    const result = await client.query(q.Paginate(q.Documents(q.Collection("requests")), { size: 1000 }));
    if (result.data.length === 0) {
      return { statusCode: 200, body: JSON.stringify({ success: true, message: "No requests to delete" }) };
    }
    await client.query(q.Map(result.data, q.Lambda("ref", q.Delete(q.Var("ref")))));
    return { statusCode: 200, body: JSON.stringify({ success: true, deleted: result.data.length }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};