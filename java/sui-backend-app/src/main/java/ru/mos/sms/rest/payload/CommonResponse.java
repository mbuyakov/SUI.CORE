package ru.mos.sms.rest.payload;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CommonResponse {

    private Boolean success = true;
    private String message;

    public CommonResponse(String message) {
        this.message = message;
    }

}
