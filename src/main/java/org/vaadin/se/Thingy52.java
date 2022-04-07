package org.vaadin.se;

import com.vaadin.flow.component.*;
import com.vaadin.flow.component.dependency.JsModule;
import com.vaadin.flow.component.page.Page;
import com.vaadin.flow.function.SerializableConsumer;
import com.vaadin.flow.shared.Registration;
import elemental.json.JsonObject;
import elemental.json.JsonValue;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.Random;

@JsModule("./thingy52.js")
@JsModule("./thingy52import.js")
public class Thingy52 {

    private String deviceId;
    private int batteryLevel;
    private EventProxy eventProxy = new EventProxy();
    private boolean buttonPressed;

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

        public static Color randomColor() {
            return values()[new Random().nextInt(values().length)];
        }
    }

    private static final String INTEGRATION_JS = "/thingy_integration.js";

    public Thingy52() {
        UI.getCurrent().getElement().appendVirtualChild(eventProxy.getElement());
        JsLoader.load(UI.getCurrent()
                        .getPage(), Thingy52.class, INTEGRATION_JS, eventProxy);
    }

    public void scan() {


        final SerializableConsumer<JsonValue> resultHandler = json -> {
            this.deviceId = json.asString();
            setLed(255, 255, 255);
            beep();
        };
        final SerializableConsumer<String> errorHandler = err -> {
            throw new RuntimeException("Bluetooth scan failed: '" + err + "'");
        };
        UI.getCurrent()
                .getPage()
                .executeJs("return $0.scan()", eventProxy).then(resultHandler, errorHandler);
    }


    public void disconnect() {
        UI.getCurrent().getPage().executeJs("$0.disconnect()", eventProxy);
    }

    public void setLed(int r, int g, int b) {
        UI.getCurrent().getPage().executeJs("$0.setLED($1,$2,$3)", eventProxy, r, g, b);
    }

    public void setLedBreathe(Color color, int intensity, int delayMs) {
        UI.getCurrent().getPage().executeJs("$0.setLEDBreathe($1,$2,$3)", eventProxy, color.value, intensity, delayMs);
    }

    public void setLedFlashOnce(Color color, int intensity) {
        UI.getCurrent().getPage().executeJs("$0.setLEDFlashOnce($1,$2)", eventProxy, color.value, intensity);
    }

    public void setLedOff() {
        UI.getCurrent().getPage().executeJs("$0.setLEDOff()", eventProxy);
    }

    public void beep() {
        UI.getCurrent().getPage().executeJs("$0.beep()", eventProxy);
    }

    public void beep(int frequencyHz, int durationMs, int vol) {
        UI.getCurrent().getPage().executeJs("$0.beep($1,$2,$3)", eventProxy, frequencyHz, durationMs, vol);
    }

    @Tag(Tag.DIV)
    private class EventProxy extends Component {

        @ClientCallable
        public void batteryLevel(int batteryLevel) {
            Thingy52.this.batteryLevel = batteryLevel;
        }

        @ClientCallable
        public void button(boolean pressed) {
            Thingy52.this.buttonPressed = pressed;
        }

        /** Override to publish to the main class. */
        @Override
        protected <T extends ComponentEvent<?>> Registration addListener(Class<T> eventType, ComponentEventListener<T> listener) {
            return super.addListener(eventType, listener);
        }
    }

    public Registration addBatteryChangeListener(
            ComponentEventListener<BatteryChangeEvent> listener) {
        return eventProxy.addListener(BatteryChangeEvent.class, listener);
    }

    public Registration addButtonListener(
            ComponentEventListener<ButtonEvent> listener) {
        return eventProxy.addListener(ButtonEvent.class, listener);
    }

    public Registration addAccelerometerListener(
            ComponentEventListener<AccelerometerChange> listener) {
        return eventProxy.addListener(AccelerometerChange.class, listener);
    }

    public Registration addTemperatureListener(
            ComponentEventListener<TemperatureChange> listener) {
        return eventProxy.addListener(TemperatureChange.class, listener);
    }


    @DomEvent("thingy52_battery")
    public static class BatteryChangeEvent
            extends ComponentEvent<EventProxy> {
        private final int batteryLevel;

        public BatteryChangeEvent(EventProxy source,
                                  boolean fromClient,
                                  @EventData("event.detail") JsonObject detail) {
            super(source, fromClient);
            this.batteryLevel = (int) detail.getNumber("batteryLevel");
        }

        public int getBatteryLevel() {
            return batteryLevel;
        }
    }

    @DomEvent("thingy52_button")
    public static class ButtonEvent
            extends ComponentEvent<EventProxy> {
        private final boolean pressed;

        public ButtonEvent(EventProxy source,
                           boolean fromClient,
                           @EventData("event.detail") JsonObject detail) {
            super(source, fromClient);
            this.pressed = detail.getBoolean("pressed");
        }

        public boolean isButtonPressed() {
            return pressed;
        }
    }

    @DomEvent("thingy52_accelerometer")
    public static class AccelerometerChange
            extends ComponentEvent<EventProxy> {
        private final double x,y,z;

        public AccelerometerChange(EventProxy source,
                           boolean fromClient,
                           @EventData("event.detail") JsonObject detail) {
            super(source, fromClient);
            this.x = detail.getNumber("x");
            this.y = detail.getNumber("y");
            this.z = detail.getNumber("z");
        }

        public double[] getXYZ() {
            return new double[] {x,y,z};
        }
    }

    @DomEvent("thingy52_temperature")
    public static class TemperatureChange
            extends ComponentEvent<EventProxy> {
        private final double temperature;

        public TemperatureChange(EventProxy source,
                                   boolean fromClient,
                                   @EventData("event.detail") JsonObject detail) {
            super(source, fromClient);
            this.temperature = detail.getNumber("temperature");
        }

        public double getTemperature() {
            return temperature;
        }
    }

    /** Runtime JS loader.
     *
     */
    private static class JsLoader implements Serializable {

        private static String readJS(Class cls, String resourceName) {
            try (InputStream stream = cls.getResourceAsStream(resourceName);
                 BufferedReader bf = new BufferedReader(
                         new InputStreamReader(stream,
                                 StandardCharsets.UTF_8))) {
                StringBuilder builder = new StringBuilder();
                bf.lines().forEach(builder::append);
                return builder.toString();
            } catch (IOException e) {
                throw new RuntimeException(
                        "Couldn't read JavaScript file "
                                + resourceName + ". The package is broken",
                        e);
            }
        }

        public static void load(Page page, Class<Thingy52> cls, String resourceName, Component eventProxy) {
            page.executeJs(JsLoader.readJS(cls, resourceName), eventProxy);
        }

    }
}
