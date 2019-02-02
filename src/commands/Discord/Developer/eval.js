const { DiscordCommand } = require('../../../core');

const { inspect } = require('util');

module.exports = class Eval extends DiscordCommand {
  constructor(bot) {
    super(bot, {
      name       : 'eval',
      syntax     : 'eval <...code:str>',
      aliases    : [],
      argument   : [],
      description: 'Evaluate a snippet',

      hidden     : false,
      enabled    : true,
      cooldown   : 0,
      category   : 'Developer',
      ownerOnly  : true,
      guildOnly  : false,
      permissions: [ 'embedLinks' ]
    });
  }

  async execute(msg, args) {
    let result;
    let errored = false;

    if (args.length <= 0) return msg.channel.createMessage(this.localize(msg.author.locale['developer']['eval']['args']));

    const message = await msg.channel.createMessage(this.localize(msg.author.locale['developer']['eval']['busy']));

    try { result = eval(args.join(' ')); }
    catch (ex) { result = ex; errored = true; }
    finally {
      result = this.sanitize(String(inspect(result)));

      message.edit({
        content: '',
        embed: {
          color      : errored ? this.bot.col['developer']['eval']['failure'] : this.bot.col['developer']['eval']['success'],
          description: this.localize(msg.author.locale['developer']['eval']['result'].join('\n'), { resultType: errored ? msg.author.locale['developer']['eval']['types'][1] : msg.author.locale['developer']['eval']['types'][0], resultMessage: this.bot.util.shorten(result, 1950) || '{}' })
        }
      });
    };
  }

  sanitize(msg) {
    if (!msg) return undefined;

    for(let _ in this.bot.conf['api']) msg = msg.replace(new RegExp(this.bot.conf['api'][_], 'gi'), '<--snip-->');

    return msg
      .replace(new RegExp(this.bot.token, 'gi'), '<--snip-->')
      .replace(new RegExp(this.bot.conf['discord']['token'], 'gi'), '<--snip-->');
  }

  localize(msg, extData) {
    if (!msg) return '';

    if (extData && extData.resultType)    msg = msg.replace(/\$\[result:type]/g, extData.resultType);
    if (extData && extData.resultMessage) msg = msg.replace(/\$\[result:message]/g, extData.resultMessage);

    return msg
    .replace(/\$\[emoji#0]/g, this.bot.emote('developer', 'eval', '0'))
    .replace(/\$\[emoji#1]/g, this.bot.emote('developer', 'eval', '1'))
    .replace(/\$\[emoji#2]/g, this.bot.emote('developer', 'eval', '2'));
  }
};