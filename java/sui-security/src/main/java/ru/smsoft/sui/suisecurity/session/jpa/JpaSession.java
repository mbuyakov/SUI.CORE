package ru.smsoft.sui.suisecurity.session.jpa;

import lombok.*;
import ru.smsoft.sui.suisecurity.session.Session;

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
    private Date lastUserActivity;
    private Boolean active;
    private Date disablingDate;

    public static JpaSession fromSession(Session session) {
        return new JpaSession(
            session.getId(),
            session.getUserId(),
            session.getExpiryDate(),
            session.getLastUserActivity(),
            session.getActive(),
            session.getDisablingDate()
        );
    }

    public Session toSession() {
        return new Session(id, userId, expiryDate, lastUserActivity, active, disablingDate);
    }

}
