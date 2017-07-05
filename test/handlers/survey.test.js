import test from 'ava'
import sinon from 'sinon'
import setupBot from '../helpers/setupBot'

test.beforeEach(setupBot)
test.beforeEach(({ context }) => { context.user = context.bot.createUser() })

test('bot gives a survey', async t => {
  const { bot, controller, user } = t.context

  const survey = {
    id: '143',
    data: {
      questions: [
        { text: 'What is your favorite color?', type: 'text', id: 1 },
        { text: 'What is your favorite sport?', type: 'text', id: 2 }
      ]
    }
  }
  const recordAnswer = sinon.stub()

  controller.trigger(
    'survey_started',
    [bot, { survey, roomId: user.channel, personEmail: user.id, recordAnswer }]
  )

  const firstQuestion = await bot.nextResponse()
  t.is(firstQuestion.text, 'What is your favorite color?')
  t.is(firstQuestion.channel, user.channel)

  const favoriteColor = 'blue'
  user.says(favoriteColor)

  const secondQuestion = await bot.nextResponse()
  t.is(secondQuestion.text, 'What is your favorite sport?')

  const favoriteSport = 'fuß'
  user.says(favoriteSport)

  const next = await bot.nextResponse()
  t.is(next.text, 'Thanks for your responses!')

  t.true(recordAnswer.calledWith(survey.id, survey.data.questions[0].id, favoriteColor))
  t.true(recordAnswer.calledWith(survey.id, survey.data.questions[1].id, favoriteSport))
})

test('bot gives a survey with mulitple choice question', async t => {
  const { bot, controller, user } = t.context

  const survey = {
    id: '143',
    data: {
      questions: [
        { text: 'What is your favorite color?', type: 'text', id: 1 },
        { text: 'Mac or PC?', type: 'multi', choices: ['Mac', 'PC'], id: 2 }
      ]
    }
  }
  const recordAnswer = sinon.stub()

  controller.trigger(
    'survey_started',
    [bot, { survey, roomId: user.channel, personEmail: user.id, recordAnswer }]
  )

  const firstQuestion = await bot.nextResponse()
  t.is(firstQuestion.text, 'What is your favorite color?')
  t.is(firstQuestion.channel, user.channel)

  const favoriteColor = 'blue'
  user.says(favoriteColor)

  const secondQuestion = await bot.nextResponse()
  t.is(secondQuestion.text, 'Mac or PC?\n1. Mac\n2. PC')

  const mac = '1'
  user.says(mac)

  const next = await bot.nextResponse()
  t.is(next.text, 'Thanks for your responses!')

  t.true(recordAnswer.calledWith(survey.id, survey.data.questions[0].id, favoriteColor))
  t.true(recordAnswer.calledWith(survey.id, survey.data.questions[1].id, mac))
})
