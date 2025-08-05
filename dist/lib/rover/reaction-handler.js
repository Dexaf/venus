export const reactionHandling = (reactions) => {
    reactions.forEach((r) => {
        if (r.isActive)
            r.reaction();
    });
};
