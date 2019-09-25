package ru.mos.sms.rest.controller;

import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import ru.mos.sms.rest.payload.UserIdentityAvailability;
import ru.mos.sms.rest.payload.UserProfile;
import ru.smsoft.sui.suientity.repository.suisecurity.UserRepository;
import ru.smsoft.sui.suisecurity.security.CurrentUser;
import ru.smsoft.sui.suisecurity.security.UserPrincipal;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    @NonNull
    private UserRepository userRepository;

    @GetMapping("/me")
    @PreAuthorize("hasRole('USER')")
    public UserProfile getCurrentUser(@CurrentUser UserPrincipal currentUser) {
        return new UserProfile(currentUser.getUser().getId(), currentUser.getUsername(), currentUser.getUser().getName(), currentUser.getUser().getEmail());
    }

    @GetMapping("/checkUsernameAvailability")
    public UserIdentityAvailability checkUsernameAvailability(@RequestParam(value = "username") String username) {
        Boolean isAvailable = !userRepository.existsByUsername(username);
        return new UserIdentityAvailability(isAvailable);
    }

    @GetMapping("/checkEmailAvailability")
    public UserIdentityAvailability checkEmailAvailability(@RequestParam(value = "email") String email) {
        Boolean isAvailable = !userRepository.existsByEmail(email);
        return new UserIdentityAvailability(isAvailable);
    }

}
