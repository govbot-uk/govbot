module.exports = {
    customId: 'role-select',
    
    initialize(roles) {
        return new StringSelectMenuBuilder()
            .setCustomId(this.customId)
            .setPlaceholder('Select roles to add/remove')
            .setMinValues(0)
            .setMaxValues(roles.length);
    },

    async execute(interaction) {
        const selectedRoles = interaction.values;
        const member = interaction.member;
        const changes = [];
        const botMember = interaction.guild.members.me;

        // Check if bot has necessary permissions
        if (!botMember.permissions.has('ManageRoles')) {
            return await interaction.reply({
                content: 'I don\'t have permission to manage roles.',
                flags: ['Ephemeral']
            });
        }

        // Get all available roles from the select menu
        const availableRoles = interaction.component.options.map(o => o.value);
        
        // Find roles to remove (roles user has that aren't in selection)
        const rolesToRemove = member.roles.cache
            .filter(role => availableRoles.includes(role.id) && !selectedRoles.includes(role.id));

        const botHighestRole = botMember.roles.highest;

        // Handle removals
        for (const role of rolesToRemove.values()) {
            if (role.position >= botHighestRole.position) {
                changes.push(`⚠️ Cannot modify ${role.name} - role is too high`);
                continue;
            }
            try {
                await member.roles.remove(role);
                changes.push(`❌ Removed ${role.name}`);
            } catch (error) {
                changes.push(`❌ Failed to remove ${role.name}`);
                interaction.client.logger.error(`Failed to remove role ${role.name}:`, error);
            }
        }

        // Handle additions
        for (const roleId of selectedRoles) {
            const role = interaction.guild.roles.cache.get(roleId);
            if (!role) continue;

            if (role.position >= botHighestRole.position) {
                changes.push(`⚠️ Cannot modify ${role.name} - role is too high`);
                continue;
            }

            if (!member.roles.cache.has(roleId)) {
                try {
                    await member.roles.add(roleId);
                    changes.push(`✅ Added ${role.name}`);
                } catch (error) {
                    changes.push(`❌ Failed to add ${role.name}`);
                    interaction.client.logger.error(`Failed to add role ${role.name}:`, error);
                }
            }
        }

        await interaction.reply({
            content: changes.length > 0 
                ? `Role changes:\n${changes.join('\n')}`
                : 'No changes were needed - you already have the selected configuration.',
            flags: ['Ephemeral']
        });
    },
};