---
sort: 6
image: /assets/images/og-study-ai-v2.jpg
---

# AI for embedded engineers

I came to AI from an unusual place: comfortable with C, firmware, buffers, DMA,
fixed-point and reading a memory map, but with no real idea what was happening
inside a model.

So I am writing down what I learn, here.

I start from the basics (**vectors, matrices, dot products**) and work up through
**embeddings, Transformers, attention, quantization and runtimes**. The goal is
not to call an API and get a model running. It is to open the code and understand:

> **where the data is, which operation is running, and why it costs exactly that
> much time and memory.**

The end of the road: getting a real LLM onto hardware with **512KB of SRAM**.

## What I am actually learning

Three layers, though I try not to treat them as separate subjects.

**First, the maths.**

Vectors, matrices, dot products, gradients, backpropagation.

This sounds far from AI, but from an embedded angle most of it is familiar
ground: arrays of numbers, multiply-accumulate, convolution, accumulation.

**Then, the model.**

Embeddings, attention, Transformers, KV cache, sampling.

This is where the operations from the first layer assemble into a working model.
Instead of just knowing `model.generate()`, I want to know what each block inside
is doing.

**Finally, the runtime.**

Quantization, memory hierarchy, performance, ONNX Runtime, TensorRT, TIDL.

This is where embedded experience starts paying off: where the model lives, how
data moves through memory, whether the bottleneck is compute or bandwidth, and
how large a model can get before it stops fitting on the device.

One rule I try to hold to throughout:

> **If I can point at the code and measure it, I will not settle for a formula.**

Talking about `RMSNorm` means opening the line that implements it. Talking about
memory means looking at `model.bin` itself. Claiming an operation takes a certain
time means running a benchmark instead of guessing.

## Not just the ESP32

The ESP32-S3 is the chip used by the repo I am learning from (see below), and it
makes a good reference point because it is small enough that every wasted byte
shows up immediately. But what I actually want to understand is **what happens
when a model meets a particular kind of silicon**, and that story repeats almost
unchanged across vendors:

| Silicon | Accelerator | Runtime | In this series |
|---|---|---|---|
| **ESP32-S3** (Xtensa LX7) | none, narrow SIMD only | hand-written plain C | main reference, runs for real |
| **CPU** x86-64 / ARM / Apple Silicon | AVX2, NEON | plain C + OpenMP | benchmarks you can run on your own machine |
| **NVIDIA** Jetson, discrete GPUs | Tensor Core | CUDA, TensorRT | real runtime in the repo, plus chapter 9 |
| **TI** TDA4VM, AM68A, AM69A | **C7x DSP + MMA** | TIDL via ONNX Runtime EP | chapter 9, mapped concept by concept onto TensorRT |
| **Qualcomm** Snapdragon | **Hexagon Tensor Accelerator** | QNN, SNPE | one line in a hardware table in chapter 3 |

Stated plainly so nobody goes hunting: TI and NVIDIA have real content here.
Hexagon currently appears in exactly one row of one table. It is listed because
it belongs to the same family, not because I have done serious work with it.

The most interesting thing I found reading across vendors: after understanding
TensorRT, TI's TIDL documentation contains almost nothing new. Same problem
(carve the graph into subgraphs, calibrate INT8, fall back to CPU for whatever
the accelerator cannot swallow), different names and a different vendor.
Understanding one gets you the other, and that is the part worth learning rather
than memorising one company's API.

## What this is not

This is not a data science course.

I am not covering:

* prompt engineering or how to use commercial model APIs;
* pandas, statistics, or data analysis workflow;
* training large foundation models;
* computer vision as a field in its own right.

Computer vision shows up only where it is needed to reach topics like VLA and
robotics.

What I want sits at the intersection of **AI and embedded**: looking at a PyTorch
tensor and knowing which bytes it becomes at runtime; looking at a `for` loop in
C and recognising which operation of the model it is performing.

## The repo I am learning from

Plainly, so there is no confusion: **PLE TinyLM is not my project.**

It is the work of [**Viacheslav Sierbov (slvDev)**](https://x.com/slvDev),
released under the MIT license. Everything hard in it belongs to the original
author: putting Gemma's Per-Layer Embeddings onto an MCU, splitting the weights
by access pattern so 25 million parameters can live in flash, the hand-written
Xtensa C runtime, and the measurements taken on real hardware.

My part is much smaller: clone it, read it, run it, measure it on my own machine,
and write down what I understood. This series is **notes from someone reading the
code**, not an introduction from the person who wrote it. The copy I use for my
own experiments lives at
[github.com/ninhnn2/machineai](https://github.com/ninhnn2/machineai).

Why I picked this repo to learn from: it is a roughly **28.9 million parameter**
LLM that genuinely runs on an **ESP32-S3**, not a toy example.

What I like about it is that one `model.bin` file passes through several very
different layers of hardware:

```text
              src/model.py  (PyTorch)
                     │
                     │ export
                     ▼
                  model.bin
                     │
      ┌──────────────┼──────────────┐
      ▼              ▼              ▼
  ESP32-S3          CPU          Jetson
  Xtensa LX7    x86 / ARM /       CUDA
  plain C       Apple Silicon
```

Same algorithm, but change the hardware and the bottleneck changes with it. On
the ESP32 the limit is weight-read bandwidth; on the Jetson the model is small
enough that kernel launch overhead takes most of the time.

That is one of the things I wanted to verify with a benchmark rather than take on
faith.

## If you come from embedded

You do not need any machine learning background to start.

Being comfortable with C, pointers, buffers, fixed-point, DMA and memory helps a
lot. Python appears only as much as it takes to load a checkpoint, inspect a
tensor and run an experiment.

You also do not need a GPU. Most experiments run on a CPU, including Apple
Silicon.

The series starts with the **vector**, which looks trivial and turns out to hold
up almost everything that follows.

## The series

| # | Topic | Status |
|---|---|---|
| 1 | [Vectors: data in AI](01-vector.html) | published |
| 2 | Weights: what the model knows | translating |
| 3 | Matrix multiplication: the operation that eats 90% of the time | writing |
| 4 | Gradients: how a model learns | writing |
| 5 | Backpropagation | writing |
| 6 | A real Transformer: assembling the first blocks | writing |
| 7 | KV cache and token sampling | writing |
| 8 | Quantization: from the Q15 you already know to int4 | writing |
| 9 | Runtimes: TensorRT, ONNX Runtime, TIDL | writing |
| 10 | VLA: language models for robots | writing |

Chapters not yet published here are kept in
[`docs/`](https://github.com/ninhnn2/machineai/tree/main/docs) in the repo, in
Vietnamese.

{% include list.liquid all=true %}
