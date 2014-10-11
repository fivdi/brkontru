/*
 * lpc810          | bbb uart1        | bbb uart4
 * ----------------+------------------+-----------------
 * pio_4/pin 2/tx  | p9_26 (uart1_rx) | p9_11 (uart4_rx)
 * pio_5/pin 1/rx  | p9_24 (uart1_tx) | p9_13 (uart4_tx)
 *
 */
#include "LPC8xx.h"

#include <cr_section_macros.h>

void SysTick_Handler(void) {
    // Toggle PIO0_1
    LPC_GPIO_PORT->NOT0 = 2;
}

void UART0_IRQHandler(void) {
    static uint8_t ch = 'A';
    static uint16_t count = 0;

    if (LPC_USART0->INTSTAT & 0x01) { // Receiver ready flag.
        ch = LPC_USART0->RXDATA;

        // Enable UART0 TXRDYEN interrupts
        LPC_USART0->INTENSET = 0x04;
        count = 11520;
    }

    if (LPC_USART0->INTSTAT & 0x04) { // Transmitter ready flag.
        if (count) {
            --count;
            LPC_USART0->TXDATA = ch;
        }

        if (count == 0) {
            LPC_USART0->INTENCLR = 0x04;
        }
    }
}

int main(void) {
    // 30Mhz
    LPC_SYSCON->SYSPLLCTRL = 0x24;
    LPC_SYSCON->SYSAHBCLKDIV = 0x02;

    LPC_SYSCON->PDRUNCFG &= ~(0x80);
    while (!(LPC_SYSCON->SYSPLLSTAT & 0x01));

    LPC_SYSCON->MAINCLKSEL = 0x03;
    LPC_SYSCON->MAINCLKUEN = 0x01;
    while (!(LPC_SYSCON->MAINCLKUEN & 0x01));

    // 1 wait state for flash
    LPC_FLASHCTRL->FLASHCFG &= ~(0x03);

    // PIO0_1 is an output
    LPC_GPIO_PORT->DIR0 |= 0x02;

    // Disable reset pin, it's needed for U0-RXD
    LPC_SWM->PINENABLE0 |= 0x40;

    // Enable UART0 clock
    LPC_SYSCON->SYSAHBCLKCTRL |= (0x1 << 14);

    // Reset UART0
    LPC_SYSCON->PRESETCTRL &= ~(0x1 << 3);
    LPC_SYSCON->PRESETCTRL |= (0x1 << 3);

    // Enable U0-TXD on PIO0_4 (Pin 2) PINASSIGN0(7:0)
    // Enable U0-RXD on PIO0_5 (Pin 1) PINASSIGN0(15:8)
    LPC_SWM->PINASSIGN0 = 0xffff0504;

    // UART0 baud rate 115200
    LPC_SYSCON->UARTCLKDIV = 1;
    LPC_SYSCON->UARTFRGDIV = 255;
    LPC_SYSCON->UARTFRGMULT = 207; // 9600->90,  115200->207
    LPC_USART0->BRG = 17;          // 9600->288, 115200->17

    // UART0 enabled, 8 bit, no parity, 1 stop bit, no flow control
    LPC_USART0->CFG = 0x05;

    // Enable UART0 RXRDYEN
    LPC_USART0->INTENSET = 0x01;
    NVIC_EnableIRQ(UART0_IRQn);

    SysTick_Config(30000000/10);
 
    while (1);
}

