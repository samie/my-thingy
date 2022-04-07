package org.vaadin.se;

import com.vaadin.flow.component.Component;
import com.vaadin.flow.component.UI;
import com.vaadin.flow.component.dependency.JsModule;

import java.util.Random;

@JsModule("./thingy52.js")
@JsModule("./globalThingy.js")
public class Thingy52 {


    /* Supported led modes.
          0 = off, 1 = on, 2 = breathe, 3 = one shot
        */
    public enum LedMode {
        OFF(0), 
        ON(1),
        BREATHE(2),
        FLASH_ONCE(3);

        private final int value;

        LedMode(int mode) {
            this.value = mode;
        }
    }

    public enum Color {
        RED(1),
        GREEN(2),
        YELLOW(3),
        BLUE(4),
        PURPLE(5),
        CYAN(6),
        WHITE(7);

        private final int value;

        Color(int value) {
            this.value = value;
        }

        public static Color randomColor()  {
            return values()[new Random().nextInt(values().length)];
        }
    }
    public void scan() {
        UI.getCurrent().getPage().executeJs("Thingy.scan()");
    }

    public void disconnect() {
        UI.getCurrent().getPage().executeJs("Thingy.disconnect()");
    }

    public void setLed(int r, int g, int b) {
        UI.getCurrent().getPage().executeJs("Thingy.setLED($0,$1,$2)",  r, g, b);
    }

    public void setLedBreathe(Color color, int intensity, int delayMs) {
        UI.getCurrent().getPage().executeJs("Thingy.setLEDBreathe($0,$1,$2)", color.value, intensity, delayMs);
    }

    public void setLedFlashOnce(Color color, int intensity) {
        UI.getCurrent().getPage().executeJs("Thingy.setLEDFlashOnce($0,$1)", color.value, intensity);
    }

    public void setLedOff() {
        UI.getCurrent().getPage().executeJs("Thingy.setLEDOff()");
    }


}
