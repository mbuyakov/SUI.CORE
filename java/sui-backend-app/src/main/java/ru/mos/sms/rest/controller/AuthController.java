package ru.mos.sms.rest.controller;

import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import lombok.val;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.mos.sms.rest.payload.*;
import ru.smsoft.sui.suientity.repository.suisecurity.RoleRepository;
import ru.smsoft.sui.suientity.repository.suisecurity.UserRepository;
import ru.smsoft.sui.suisecurity.security.JwtTokenProvider;
import ru.smsoft.sui.suisecurity.security.UserPrincipal;

import javax.validation.Valid;
import java.util.HashSet;
import java.util.function.Function;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Transactional
@Slf4j
public class AuthController {

    @NonNull
    private AuthenticationManager authenticationManager;

    @NonNull
    private UserRepository userRepository;

    @NonNull
    private RoleRepository roleRepository;

    @NonNull
    private PasswordEncoder passwordEncoder;

    @NonNull
    private JwtTokenProvider tokenProvider;

    @PostMapping("/signin")
    public ResponseEntity<JwtAuthenticationResponse> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        val authentication = authenticationManager.authenticate(loginRequest.toAuthenticationToken());
        SecurityContextHolder.getContext().setAuthentication(authentication);
        val jwt = tokenProvider.generateToken(authentication);
        val principal = (UserPrincipal) authentication.getPrincipal();
        return ResponseEntity.ok(new JwtAuthenticationResponse(jwt, principal));
    }

    @PostMapping("/checkToken")
    public ResponseEntity<Boolean> checkToken(@Valid @RequestBody String token) {
        return ResponseEntity.ok(tokenProvider.validateToken(token));
    }

    @PostMapping("/signup")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CommonResponse> signup(
            @Valid @RequestBody SignUpRequest signUpRequest) {
        return processCommonRequest(
                signUpRequest,
                (data) -> checkUserExisting(null, data.getUsername(), data.getEmail()),
                (data) -> {
                    val user = signUpRequest.toUser(roleRepository.findAll());
                    user.setPassword(passwordEncoder.encode(user.getPassword()));
                    userRepository.save(user);
                    return new CommonResponse("Пользователь успешно зарегистрирован");
                });
    }

    @PostMapping("/updatePassword")
    @PreAuthorize("hasRole('ADMIN') OR principal.id == #request.userId")
    public ResponseEntity<CommonResponse> updatePassword(@Valid @RequestBody UpdatePasswordRequest request) {
        return processCommonRequest(
                request,
                null,
                (data) -> {
                    userRepository.findById(data.getUserId()).ifPresent(user -> {
                        user.setPassword(passwordEncoder.encode(request.getPassword()));
                        userRepository.save(user);
                    });
                    return new CommonResponse("Пароль успешно обновлен");
                });
    }

    @PostMapping("/updateRoles")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CommonResponse> updateRoles(@Valid @RequestBody UpdateRolesRequest request) {
        return processCommonRequest(
                request,
                null,
                (data) -> {
                    userRepository.findById(data.getUserId()).ifPresent(user -> {
                        user.setRoles(new HashSet<>(roleRepository.findAllById(request.getRoleIds())));
                        userRepository.save(user);
                    });
                    return new CommonResponse("Роли успешно обновлены");
                });
    }

    private String checkUserExisting(Long exceptId, String username, String email) {
        if (exceptId == null
                ? userRepository.existsByEmail(email)
                : userRepository.existsByEmailAndIdNot(email, exceptId)) {
            return "Данный адрес электронной почты уже занят";
        }
        if (exceptId == null
                ? userRepository.existsByUsername(username)
                : userRepository.existsByUsernameAndIdNot(username, exceptId)) {
            return "Данное имя пользователя уже занято";
        }
        return null;
    }

    private <T> ResponseEntity<CommonResponse> processCommonRequest(
            T request,
            Function<T, String> badRequestChecker, // String - error message
            Function<T, CommonResponse> logic) {
        String errorMessage = badRequestChecker == null ? null : badRequestChecker.apply(request);

        if (errorMessage == null) {
            return ResponseEntity.ok(logic.apply(request));
        } else {
            return ResponseEntity.badRequest().body(new CommonResponse(false, errorMessage));
        }
    }
}
