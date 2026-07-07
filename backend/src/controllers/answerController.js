const Answer = require('../models/Answer');

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const allowedVoteValues = new Set([-1, 0, 1]);

async function voteAnswer(req, res, next) {
  try {
    if (!uuidRegex.test(req.params.id)) {
      return res.status(400).json({
        message: 'Valid answer id is required'
      });
    }

    const value = Number(req.body.value);

    if (!Number.isInteger(value) || !allowedVoteValues.has(value)) {
      return res.status(400).json({
        message: 'value must be -1, 0, or 1'
      });
    }

    const answer = await Answer.vote({
      answerId: req.params.id,
      userId: req.user.id,
      universityId: req.user.universityId,
      value
    });

    if (!answer) {
      return res.status(404).json({
        message: 'Answer not found'
      });
    }

    return res.status(200).json({
      message: 'Vote saved successfully',
      answer
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  voteAnswer
};
