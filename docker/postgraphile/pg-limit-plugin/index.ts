const limitFieldsPlugin = (builder) => {
    const maxLimit = Number(process.env.MAX_LIMIT);
    builder.hook('GraphQLObjectType:fields:field', (field, build, context) => {
        const { scope: { isRootQuery } } = context;

        if (!isRootQuery) {
            return field;
        }

        const originalResolve = field.resolve;
        const newResolve = async (source, args, context, info) => {

            if (args.first > maxLimit || !args.first) {
                args.first = maxLimit;
            }

            return originalResolve ? await originalResolve(source, args, context, info) : source;
        };

        return Object.assign({}, field, {
            resolve: newResolve,
        });
    });
};

module.exports = limitFieldsPlugin;