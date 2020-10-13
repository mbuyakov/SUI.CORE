package ru.sui.suisecurity.base.session.jpa;

import lombok.*;
import ru.sui.suisecurity.base.session.Session;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import java.util.Date;
import java.util.UUID;


@Getter
@Setter(AccessLevel.PRIVATE)
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(schema = "sui_security", name = "session")
public class JpaSession {

    @Id
    private UUID id;
    private Long userId;
    private Date expiryDate;
    private String remoteAddress;
    private Date created;
    private Date lastUserActivity;
    private Boolean active;
    private Date disablingDate;

    public static JpaSession fromSession(Session session) {
        return new JpaSession(
            session.getId(),
            session.getUserId(),
            session.getExpiryDate(),
            session.getRemoteAddress(),
            session.getCreated(),
            session.getLastUserActivity(),
            session.getActive(),
            session.getDisablingDate()
        );
    }

    public Session toSession() {
        return new Session(id, userId, expiryDate, remoteAddress, created, lastUserActivity, active, disablingDate);
    }

}
