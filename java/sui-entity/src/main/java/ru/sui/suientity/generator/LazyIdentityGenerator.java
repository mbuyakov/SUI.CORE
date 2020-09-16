package ru.sui.suientity.generator;

import org.hibernate.HibernateException;
import org.hibernate.engine.spi.SharedSessionContractImplementor;
import org.hibernate.id.IdentifierGenerator;
import org.hibernate.id.IdentityGenerator;

import java.io.Serializable;
import java.util.Optional;

public class LazyIdentityGenerator extends IdentityGenerator implements IdentifierGenerator {

    @Override
    public Serializable generate(SharedSessionContractImplementor session, Object object) throws HibernateException {
        return Optional
                .ofNullable(session.getEntityPersister(null, object).getClassMetadata().getIdentifier(object, session))
                .orElse(super.generate(session, object));
    }

}
