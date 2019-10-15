package ru.mos.sms.rest.payload;

import lombok.Data;

import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import java.util.List;

@Data
public class UpdateRolesRequest {

    @NotNull
    private Long userId;

    @NotEmpty
    private List<Long> roleIds;

}
