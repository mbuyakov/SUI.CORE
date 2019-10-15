package ru.mos.sms.rest.payload;

import lombok.Data;
import ru.smsoft.sui.suientity.entity.suisecurity.Role;
import ru.smsoft.sui.suientity.entity.suisecurity.User;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.Size;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Data
public class SignUpRequest {

    @NotBlank
    @Size(min = 4, max = 40)
    private String name;

    @NotBlank
    @Size(min = 3, max = 15)
    private String username;

    @NotBlank
    @Size(max = 40)
    @Email
    private String email;

    @NotBlank
    @Size(min = 6, max = 20)
    private String password;

    @NotEmpty
    private List<Long> roleIds;

    public User toUser(List<Role> allRoles) {
        Map<Long, Role> roleById = allRoles
                .stream()
                .collect(Collectors.toMap(Role::getId, role -> role));

        return User
                .builder()
                .name(this.name)
                .username(this.username)
                .email(this.email)
                .password(this.password)
                .roles(roleIds
                        .stream()
                        .filter(roleById::containsKey)
                        .map(roleById::get)
                        .collect(Collectors.toList()))
                .build();
    }
}
