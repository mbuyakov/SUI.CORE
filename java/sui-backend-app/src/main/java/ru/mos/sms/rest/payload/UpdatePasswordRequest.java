package ru.mos.sms.rest.payload;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

@Data
public class UpdatePasswordRequest {

    @NotNull
    private Long userId;

    @NotBlank
    @Size(min = 6, max = 20)
    private String password;

}
