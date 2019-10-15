package ru.mos.sms.rest.payload;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserProfile {
    private Long id;
    private String username;
    private String name;
    private String email;
}
