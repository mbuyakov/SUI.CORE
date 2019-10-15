package ru.mos.sms.rest.payload;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import ru.smsoft.sui.suisecurity.security.UserPrincipal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JwtAuthenticationResponse {
    private String accessToken;
    private Long id;
    private String name;
    private String[] roles;

    public JwtAuthenticationResponse(String token, UserPrincipal principal) {
        this.accessToken = token;
        this.id = principal.getUser().getId();
        this.name = principal.getUser().getName();
        this.roles = principal.getAuthorities()
                .stream()
                .map(Object::toString)
                .map(s -> s.replace("ROLE_", ""))
                .toArray(String[]::new);
    }
}
