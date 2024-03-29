package ru.sui.usertransactionconfigurier.autoconfigure;

import org.springframework.context.annotation.ComponentScan;
import org.springframework.core.Ordered;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@ComponentScan("ru.sui.usertransactionconfigurier")
@EnableTransactionManagement(order = Ordered.LOWEST_PRECEDENCE - 1)
public class AutoConfiguration {

}
