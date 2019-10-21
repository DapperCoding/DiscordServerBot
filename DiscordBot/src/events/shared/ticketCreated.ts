import { Ticket } from "../../models/ticket/ticket";
import { ChannelHandler } from "../../handlers/channelHandler";
import { Guild, TextChannel, RichEmbed, GuildMember } from "discord.js";
import { ApiRequestHandler } from "../../handlers/apiRequestHandler";
import {
  DiscordUserProficiency,
  ProficiencyLevel
} from "../../models/proficiency/proficiency";
import { GuildHelper } from "../../helpers/guildHelper";
import { TicketHelper } from "../../helpers/ticketHelper";
import { Constants } from "../../constants";

export class TicketCreatedEvent {
  public static handle = (ticket: Ticket, server: Guild) => {
    let member = server.members.get(ticket.applicant.discordId);
    if (!member) return;
    // Create new channelHandler
    new ChannelHandler(server)

      // Add author to ticket
      .createChannelTicketCommand(ticket.id, member)
      .then(async channel => {
        await TicketHelper.updateTopic(member as GuildMember, ticket);
      });

    console.log("hi");
    // Get all members with teacher (h2h) role
    let teachers = GuildHelper.GetAllWithRole("teacher") as GuildMember[];
    // Loop over all h2h-ers
    for (let i = 0; i < teachers.length; i++) {
      try {
        // Get information for discord user
        new ApiRequestHandler()
          .requestAPIWithType<DiscordUserProficiency[]>(
            "GET",
            null,
            "proficiency/GetProficienciesForDiscordUser/" +
            teachers[i].user.id
          )
          .then(proficiencies => {
            let isInLanguage = false;
            let isInFramework = false;
            if (!proficiencies || proficiencies.length <= 0) {
              isInLanguage = true;
              isInFramework = true;
            } else {
              if (!ticket.language) isInLanguage = true;
              if (!ticket.framework) isInFramework = true;

              if (!isInLanguage && !isInFramework) {
                for (
                  let proficiencyIndex = 0;
                  proficiencyIndex < proficiencies.length;
                  proficiencyIndex++
                ) {
                  let proficiency = proficiencies[proficiencyIndex];

                  if (
                    proficiency.proficiencyLevel !=
                    ProficiencyLevel.AbsoluteBeginner &&
                    proficiency.proficiencyLevel != ProficiencyLevel.JustStarted
                  ) {
                    if (ticket.language.id == proficiency.proficiencyId) {
                      isInLanguage = true;
                    } else if (ticket.framework.id == proficiency.proficiencyId) {
                      isInFramework = true;
                    }
                  }
                }
              }

              if (isInFramework || isInLanguage) {
                // Create proficiency embed
                let ticketEmbed = new RichEmbed()
                  .setTitle("Ticket: " + ticket.subject + ", has been created")
                  .setDescription(
                    ticket.applicant.username + " is in need of help!"
                  )
                  .setColor(Constants.EmbedColors.GREEN)
                  .addField("Language", ticket.language.name)
                  .addField("Framework", ticket.framework.name)
                  .addField("Their description:", ticket.description)
                  .addField(
                    "Thank you ",
                    teachers[i].displayName +
                    " for being willing to assist others in our server."
                  )
                  .addField(
                    "Ticket Portal V0.1",
                    `To read all messages sent in this ticket, click on the title of this embed to open the ticket in the Ticket Portal.`
                  )
                  .addField(
                    "If you would like to help with this request then please type:",
                    "?acceptTicket " + ticket.id
                  )
                  .setURL(
                    `https://teacher.dapperdino.co.uk/Ticket/${ticket.id}`
                  )
                  .setFooter("Thanks for all your help :)");

                // Send proficiency embed to h2h-er
                teachers[i].send(ticketEmbed).catch(console.error);
              }
            }
          });
      }
      catch (e) {

      }
    }
    return true;
  };
}
