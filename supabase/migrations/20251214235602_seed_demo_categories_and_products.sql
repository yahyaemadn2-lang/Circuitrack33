/*
  # Seed demo categories and products

  1. Demo Data
    - Insert sample categories for electronic components
    - Insert sample products across different categories
  
  2. Notes
    - This is demo data for testing the products catalog UI
    - Products are created with placeholder vendor and realistic data
*/

-- Insert demo categories
INSERT INTO categories (id, name, slug) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Microcontrollers', 'microcontrollers'),
  ('22222222-2222-2222-2222-222222222222', 'Sensors', 'sensors'),
  ('33333333-3333-3333-3333-333333333333', 'Power Supplies', 'power-supplies'),
  ('44444444-4444-4444-4444-444444444444', 'Resistors & Capacitors', 'resistors-capacitors'),
  ('55555555-5555-5555-5555-555555555555', 'Development Boards', 'development-boards'),
  ('66666666-6666-6666-6666-666666666666', 'Display Modules', 'display-modules')
ON CONFLICT (id) DO NOTHING;

-- Create a demo vendor (only if one doesn't exist)
DO $$
DECLARE
  demo_vendor_id uuid;
  demo_user_id uuid;
BEGIN
  -- Check if demo vendor exists
  SELECT id INTO demo_vendor_id FROM vendors WHERE display_name = 'CircuitRack Demo Store' LIMIT 1;
  
  IF demo_vendor_id IS NULL THEN
    -- Create demo user for vendor
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
    VALUES (
      '99999999-9999-9999-9999-999999999999',
      'demo-vendor@circuitrack.com',
      crypt('demo123456', gen_salt('bf')),
      now(),
      now(),
      now()
    )
    ON CONFLICT (id) DO NOTHING;
    
    -- Create public users record
    INSERT INTO users (id, email, role)
    VALUES (
      '99999999-9999-9999-9999-999999999999',
      'demo-vendor@circuitrack.com',
      'vendor'
    )
    ON CONFLICT (id) DO NOTHING;
    
    -- Create vendor record
    INSERT INTO vendors (id, user_id, display_name, status, commission_rate)
    VALUES (
      '88888888-8888-8888-8888-888888888888',
      '99999999-9999-9999-9999-999999999999',
      'CircuitRack Demo Store',
      'approved',
      5.0
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- Insert demo products
INSERT INTO products (id, vendor_id, category_id, name, slug, description, price, condition) VALUES
  (
    'a1111111-1111-1111-1111-111111111111',
    '88888888-8888-8888-8888-888888888888',
    '11111111-1111-1111-1111-111111111111',
    'Arduino Uno R3',
    'arduino-uno-r3',
    'The classic Arduino Uno R3 microcontroller board based on the ATmega328P. Perfect for beginners and experienced makers alike.',
    450.00,
    'new'
  ),
  (
    'a2222222-2222-2222-2222-222222222222',
    '88888888-8888-8888-8888-888888888888',
    '11111111-1111-1111-1111-111111111111',
    'ESP32 DevKit V1',
    'esp32-devkit-v1',
    'Powerful WiFi and Bluetooth enabled microcontroller with dual-core processor. Ideal for IoT projects.',
    280.00,
    'new'
  ),
  (
    'a3333333-3333-3333-3333-333333333333',
    '88888888-8888-8888-8888-888888888888',
    '22222222-2222-2222-2222-222222222222',
    'DHT22 Temperature & Humidity Sensor',
    'dht22-sensor',
    'Digital temperature and humidity sensor with high accuracy. Operating range: -40 to 80°C, 0-100% RH.',
    85.00,
    'new'
  ),
  (
    'a4444444-4444-4444-4444-444444444444',
    '88888888-8888-8888-8888-888888888888',
    '22222222-2222-2222-2222-222222222222',
    'HC-SR04 Ultrasonic Distance Sensor',
    'hc-sr04-ultrasonic',
    'Ultrasonic ranging module with 2-400cm detection range. Perfect for obstacle detection and distance measurement.',
    35.00,
    'new'
  ),
  (
    'a5555555-5555-5555-5555-555555555555',
    '88888888-8888-8888-8888-888888888888',
    '33333333-3333-3333-3333-333333333333',
    '5V 2A Power Supply Adapter',
    '5v-2a-power-supply',
    'Universal AC to DC power adapter with stable 5V 2A output. Includes multiple connector tips.',
    120.00,
    'new'
  ),
  (
    'a6666666-6666-6666-6666-666666666666',
    '88888888-8888-8888-8888-888888888888',
    '44444444-4444-4444-4444-444444444444',
    'Resistor Kit 600pcs',
    'resistor-kit-600pcs',
    'Complete resistor assortment kit with 30 values from 10Ω to 1MΩ. 1/4W, 5% tolerance.',
    150.00,
    'new'
  ),
  (
    'a7777777-7777-7777-7777-777777777777',
    '88888888-8888-8888-8888-888888888888',
    '55555555-5555-5555-5555-555555555555',
    'Raspberry Pi 4 Model B 4GB',
    'raspberry-pi-4-4gb',
    'Latest Raspberry Pi with 4GB RAM, dual 4K display support, and USB 3.0 ports. Perfect for advanced projects.',
    2850.00,
    'new'
  ),
  (
    'a8888888-8888-8888-8888-888888888888',
    '88888888-8888-8888-8888-888888888888',
    '66666666-6666-6666-6666-666666666666',
    '16x2 LCD Display Module',
    '16x2-lcd-display',
    'Standard character LCD with blue backlight. HD44780 compatible, 5V operation.',
    95.00,
    'new'
  ),
  (
    'a9999999-9999-9999-9999-999999999999',
    '88888888-8888-8888-8888-888888888888',
    '11111111-1111-1111-1111-111111111111',
    'STM32F103C8T6 Blue Pill',
    'stm32-blue-pill',
    'ARM Cortex-M3 development board with 64KB flash and 20KB RAM. Excellent for advanced embedded projects.',
    180.00,
    'new'
  ),
  (
    'b1111111-1111-1111-1111-111111111111',
    '88888888-8888-8888-8888-888888888888',
    '22222222-2222-2222-2222-222222222222',
    'MPU6050 Gyroscope & Accelerometer',
    'mpu6050-imu',
    '6-axis motion tracking device combining 3-axis gyroscope and 3-axis accelerometer. I2C interface.',
    65.00,
    'new'
  ),
  (
    'b2222222-2222-2222-2222-222222222222',
    '88888888-8888-8888-8888-888888888888',
    '55555555-5555-5555-5555-555555555555',
    'Arduino Mega 2560 R3',
    'arduino-mega-2560',
    'Arduino board with ATmega2560 microcontroller. 54 digital I/O pins, 16 analog inputs, 256KB flash memory.',
    680.00,
    'new'
  ),
  (
    'b3333333-3333-3333-3333-333333333333',
    '88888888-8888-8888-8888-888888888888',
    '44444444-4444-4444-4444-444444444444',
    'Capacitor Kit 500pcs',
    'capacitor-kit-500pcs',
    'Assorted ceramic and electrolytic capacitors. Values from 10pF to 1000µF.',
    200.00,
    'new'
  )
ON CONFLICT (id) DO NOTHING;
