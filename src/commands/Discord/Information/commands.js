const { DiscordCommand } = require('../../../core');

const moment           = require('moment'); require('../../../util/moment/format');
const { readFileSync } = require('fs');

module.exports = class Commands extends DiscordCommand {
  constructor(bot) {
    super(bot, {
      name       : 'commands',
      syntax     : 'commands [command:str]',
      aliases    : [ 'command', 'cmds', 'cmd', 'help' ],
      argument   : [ '[command:str]' ],
      description: 'Lists all commands',

      hidden     : false,
      enabled    : true,
      cooldown   : 1000,
      category   : 'Information',
      ownerOnly  : false,
      guildOnly  : false,
      permissions: [ 'embedLinks' ]
    });

    try { this.thumb = readFileSync('./assets/img/thumb/commands.png'); }
    catch(ex) { this.thumb = undefined; }
  }

  async execute(msg, args) {
    let cmd = this.bot.cmds.filter((v) => v.extData.name.toLowerCase() === args.join(' ').toLowerCase() || v.extData.aliases.includes(args.join(' ').toLowerCase()));
    
    if (cmd.length >= 1) {
      cmd = cmd[0].extData;

      msg.channel.createMessage({
        embed: {
          description: this.localize(msg.author.locale['info']['commands']['single'].join('\n'), { msg: msg, cmd: cmd })
        }
      });
    } else {
      msg.channel.createMessage({
        embed: {
          color      : this.bot.col['info']['commands'],
          thumbnail  : { url: 'attachment://thumb.png' },
          description: this.localize(msg.author.locale['info']['commands']['multi'].join('\n'), { msg: msg }),
          fields     : [
            {
              name  : msg.author.locale['info']['commands']['fields'][0],
              value : this.bot.cmds.filter((v) => v.extData.category.toLowerCase() === 'information' && !v.extData.hidden).map((v) => `**•** [\`${msg.prefix}${v.extData.name}\`](https://discordapp.com/channels/${msg.channel.guild.id}/${msg.channel.id}/${msg.id}) ${v.extData.description ? `**-** ${v.extData.description}` : ''}`).join('\n'),
              inline: true
            },
            {
              name  : msg.author.locale['info']['commands']['fields'][1],
              value : this.bot.cmds.filter((v) => v.extData.category.toLowerCase() === 'image' && !v.extData.hidden).map((v) => `**•** [\`${msg.prefix}${v.extData.name}\`](https://discordapp.com/channels/${msg.channel.guild.id}/${msg.channel.id}/${msg.id}) ${v.extData.description ? `**-** ${v.extData.description}` : ''}`).join('\n'),
              inline: true
            },
            {
              name  : msg.author.locale['info']['commands']['fields'][2],
              value : this.bot.cmds.filter((v) => v.extData.category.toLowerCase() === 'utility' && !v.extData.hidden).map((v) => `**•** [\`${msg.prefix}${v.extData.name}\`](https://discordapp.com/channels/${msg.channel.guild.id}/${msg.channel.id}/${msg.id}) ${v.extData.description ? `**-** ${v.extData.description}` : ''}`).join('\n'),
              inline: true
            },
            {
              name  : msg.author.locale['info']['commands']['fields'][3],
              value : this.bot.cmds.filter((v) => v.extData.category.toLowerCase() === 'developer' && !v.extData.hidden).map((v) => `**•** [\`${msg.prefix}${v.extData.name}\`](https://discordapp.com/channels/${msg.channel.guild.id}/${msg.channel.id}/${msg.id}) ${v.extData.description ? `**-** ${v.extData.description}` : ''}`).join('\n'),
              inline: true
            }
          ]
        }
      },
      this.thumb ? { file: this.thumb, name: 'thumb.png' } : undefined);        
    }
  }

  localize(msg, extData) {
    if (!msg) return '';

    if (extData && extData.msg) msg = msg
    .replace(/\$\[guild:name]/g, extData.msg.channel.guild.name)
    .replace(/\$\[guild:prefix]/g, extData.msg.prefix)
    .replace(/\$\[bot:invite]/g, this.bot.gatherInvite(8));

    if (extData && extData.cmd) msg = msg
      .replace(/\$\[command:name]/g, extData.cmd.name)
      .replace(/\$\[command:syntax]/g, `${extData.msg.prefix}${extData.cmd.syntax}`)
      .replace(/\$\[command:aliases]/g, extData.cmd.aliases.map((v) => `\`${v}\``).join(', ') || '`n/a`')
      .replace(/\$\[command:arguments]/g, extData.cmd.argument.map((v) => `\`${v}\``).join(', ') || '`n/a`')
      .replace(/\$\[command:cooldown#formatted]/g, moment.duration(extData.cmd.cooldown ? extData.cmd.cooldown : 0).format('YYYY[y] MM[M] DD[d] HH[h] mm[m] ss[s]'));
    
    return msg
      .replace(/\$\[emoji#0]/g, this.bot.emote('info', 'commands', '0'))
      .replace(/\$\[emoji#1]/g, this.bot.emote('info', 'commands', '1'))
      .replace(/\$\[emoji#2]/g, this.bot.emote('info', 'commands', '2'));
  }
};