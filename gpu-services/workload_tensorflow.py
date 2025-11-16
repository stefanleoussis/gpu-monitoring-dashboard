import tensorflow as tf
import random

print("Starting TensorFlow GPU workload...")

# Simple 3-layer network for GPU stress testing
model = tf.keras.Sequential([
    tf.keras.layers.Dense(2000, activation='relu', input_shape=(1000,)),
    tf.keras.layers.Dense(2000, activation='relu'),
    tf.keras.layers.Dense(1000)
])

optimizer = tf.keras.optimizers.Adam()

print("Running training loop. Press Ctrl+C to stop.\n")

step = 0
try:
    while True:
        # Variable batch size for creating realistic GPU utilization patterns
        batch_size = random.choice([128, 256, 512, 1024])

        x = tf.random.normal([batch_size, 1000])

        with tf.GradientTape() as tape:
            output = model(x)
            loss = tf.reduce_sum(output)

        gradients = tape.gradient(loss, model.trainable_variables)

        optimizer.apply_gradients(zip(gradients, model.trainable_variables))

        step += 1
        if step % 10 == 0:
            print(
                f"Step {step}, Loss: {loss.numpy():.4f}, Batch size: {batch_size}")


except KeyboardInterrupt:
    print("\nWorkload stopped.")
