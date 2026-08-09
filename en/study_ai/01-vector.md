---
sort: 1
image: /assets/images/og-study-ai-v2.jpg
---

# 1. Vectors: data in AI

> Article 1 in the [AI for embedded engineers](/en/study_ai/) series. Every piece
> of code and every number below comes from [**PLE TinyLM**](https://github.com/ninhnn2/machineai),
> a 28.9M-parameter LLM running on an ESP32-S3, written by
> [Viacheslav Sierbov (slvDev)](https://x.com/slvDev) and MIT licensed. The repo
> is not mine; these are notes from reading and re-running it. Clone it and read
> along, it beats reading cold.

Nearly everything AI touches (a word, a token, a pixel, a slice of audio) is
turned into **a fixed-length list of numbers** before it reaches the network.
That list is a vector. "Nearly" rather than "all": some architectures work on
graphs or sparse data, and after quantization those numbers are int8 or int4
rather than reals. But for the LLM in this repo it holds with no exceptions.

This chapter rebuilds vector intuition starting from what you already have
(`float[]` arrays, signal processing), then shows you a real vector, one that has
learned a meaning, pulled straight out of the model.

## 1.0 Why AI needs vectors at all

Before defining a vector, the better question: why does one have to exist?

To a CPU, the string `"cat"` is three bytes:

```c
char s[] = "cat";   // 99 97 116 (three numbers, nothing more)
```

Those bytes tell you `'c'` comes before `'a'`, and that is all. They do not tell
you the thing every language task depends on:

```
cat is closer to dog than to airplane
```

Worse, the only measure available on raw bytes, the difference in ASCII codes,
ranks things **arbitrarily with respect to meaning**. By that ruler the nearest
neighbours of `cat` are `car`, `cab` and `bat`, each one code apart, while
`kitten` is miles away. ASCII is just a **label**: the distance between two
labels carries no information about content.

Vectors fix exactly that. Give every token a point in D-dimensional space such
that **geometric distance means something**. After training, that space looks
roughly like this (drawn very crudely, as an imaginary 2D projection):

```
        wolf ●
     dog ●
   cat ●
                                    ● airplane
                                 ● engine
                              ● wing
```

`cat`, `dog` and `wolf` cluster; `airplane`, `engine` and `wing` cluster
elsewhere. Nobody arranged this by hand: gradient descent (chapter 4) pushed them
there because they show up in the same kinds of context.

One sentence to keep: **a vector is not a tidier way to store data, it is a
representation that turns "similar" into an arithmetic you can actually compute**
(§1.3). That is the entire reason it exists. And note the picture above is only
for intuition: the real space has 96, 128, 768 or 4096 dimensions and cannot be
drawn on paper (exercise 3).

## 1.1 What a vector is

Start from a line you have typed thousands of times:

```c
float v[128];
```

If you write C, you have been using vectors for years, nobody just called them
that. That line **is** a 128-dimensional vector. No wrapper, no special type: a
D-dimensional vector is an array of D real numbers, full stop.

Mathematics looks at the same line differently, and this second view pays off in
a moment: treat the 128 numbers as the coordinates of **a point in 128-dimensional
space**, or an arrow from the origin to that point, written
`v = [v0, v1, ..., v_{D-1}]`. Two views, one block of memory.

It is no different from the sample buffer you use for an FIR filter or an FFT.
The one difference: in DSP the array index usually means *time* (`x[n]` = the
sample at time n). In AI the index means **one learned feature dimension**, and
nobody knows in advance what dimension 37 stands for. The network works that out
on its own.

Now look at these two vectors:

```
a = [   1,    1,    1]
b = [1000, 1000, 1000]
```

Without any formula you can see exactly two things. First, they **point the same
way**: `b` is just `a` times 1000, all three components still equal. Second, `b`
is **much longer than `a`**.

Those are also the two most important geometric quantities of a vector, and
mathematics has names for them:

```
magnitude (length, norm)  = √(v0² + v1² + ... + v_{D-1}²)         -- "how long is this vector"
direction                 = v / magnitude(v)                        -- "where does it point", rescaled to length 1
```

Plug the numbers in: `magnitude(a) = √3 ≈ 1.73` and `magnitude(b) = 1000·√3 ≈ 1732`,
a factor of exactly 1000 apart, while the direction has not moved at all. The two
are **independent**: changing one does not touch the other.

This is exactly the pair of signals you meet every day: same waveform, different
amplitude. To be precise, though, it is the **square** of the magnitude that is
the signal energy:

```
energy      E = Σ v²  = ‖v‖²          <- magnitude SQUARED
magnitude   ‖v‖ = √E                   <- square root of the energy
RMS         = ‖v‖/√D = √(E/D)          <- effective amplitude
```

The `√D` is there so the number does not depend on whether you took 128 samples
or 1024.

Normalizing (`v / ‖v‖`) forces every vector to the same amplitude so that **only
direction is left**:

![Normalize: two vectors pointing the same way with different magnitudes land on
the same point on the unit circle once divided by their norm](/assets/images/study_ai/vector-normalize-en.svg)

Because `a` and `b` differ only in amplitude, after normalizing they **coincide
exactly**. That is why cosine similarity (§1.3), which is the dot product of two
normalized vectors, reflects "similar" better than a raw dot product **when
direction is all you care about**. When magnitude carries information too (§1.3),
throwing it away loses data.

The relationship between `magnitude` and **RMS** above is no coincidence:
[`RMSNorm`](https://github.com/ninhnn2/machineai/blob/main/docs/02-hieu-model.md#rmsnorm-modelpy64),
the normalization block that appears in *every* layer of the transformer in this
repo, is exactly a division by something very close to `magnitude`:

```python
# src/model.py:71
return self.weight * x * torch.rsqrt(x.pow(2).mean(-1, keepdim=True) + self.eps)
#                              ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
#                              this is 1/RMS(x), not 1/magnitude(x):
#                              dividing by mean instead of sum makes it independent of D
```

## 1.2 What vectors represent in AI

| Name | Vector of what | Typical length | In this repo |
|---|---|---|---|
| **Token embedding** | one piece of a word (token) | 96-4096 | `tok_emb.weight[id]` at [`model.py:156`](https://github.com/ninhnn2/machineai/blob/main/src/model.py#L156) |
| **Word embedding** | one whole word (pre-BPE, rare now) | 300 (classic Word2Vec) | not used |
| **Hidden state** | the model's state at 1 token, 1 layer | = `d_model` | `s->x[D]` in [`llm.h`](https://github.com/ninhnn2/machineai/blob/main/firmware/common/llm.h) |
| **Feature vector** | general features of an object | task-dependent | none |
| **Image feature** | features of an image or region (after CNN/ViT) | 512-2048 | not present (this repo is text) |
| **Audio feature** | features of an audio frame (MFCC, mel-spectrogram) | 13-128 | not present |

**What they all share:** they start as random numbers (`nn.init.normal_`,
[`model.py:195`](https://github.com/ninhnn2/machineai/blob/main/src/model.py#L195))
and **learn meaning through gradient descent** (chapter 4). Nobody programs
"dimension 37 means cat-like", it emerges because the pattern recurs in the
training data.

### "128 dimensions means 128 of what?"

The most common question. If an embedding had only 5 dimensions and **suppose**
each one carried a clean meaning, it would look like:

```
cat = [ 0.9 ,  0.8 ,  0.1 ,  0.0 ,  0.6 ]
        furry  pet    fly    swim   cute      <- labels WE attach afterwards; the model has none
```

That picture helps you start, but reality is **not** like that, and three points
need to be right from the beginning:

- no dimension is programmed with a name. The labels above are human annotation;
  the model stores them nowhere.
- one concept ("is an animal") is usually spread across **many dimensions at
  once**, and conversely one dimension usually **carries several concepts mixed
  together**. It has to: D = 128 is far smaller than the number of concepts
  TinyStories needs to represent.
- the practical consequence: reading `emb[id][37]` on its own is close to
  meaningless. Only **a whole vector compared against another whole vector**
  (§1.3) produces a readable number.

**Why 128 here and 96 elsewhere?** The repo has two configurations, do not mix
them up. The checkpoint you are about to load in Practice 1 is the small
fast-iteration build: `d_model = 128`, vocab 4096. The real ESP32-S3 deployment
build in [`RESULTS.md`](https://github.com/ninhnn2/machineai/blob/main/RESULTS.md)
uses `d_model = 96`, vocab 32768 (exercise 3 asks about that one). Different
numbers, identical reasoning.

### Practice 1: look at a real embedding that has learned a meaning

**Before you start.** Both files the script below needs are **committed in the
repo**, so a fresh clone runs immediately with no training:

```
data/bpe4096.json          BPE tokenizer, 4096 vocab
runs/ple-jetson-s0.pt      trained checkpoint (14 MB)
```

If you want to **regenerate them yourself** (to change the config, or just to
watch training happen) these two commands produce exactly those files:

```bash
# from the repo root
uv run python data/prepare.py --vocab 4096          # -> data/bpe4096.json + train/val.bin
cd src && uv run python train.py --arm ple --vocab 4096 \
    --steps 2000 --tag jetson --seed 0              # -> runs/ple-jetson-s0.pt
```

These are exactly the `prepare` and `train` steps from
[`firmware/jetson/run.sh`](https://github.com/ninhnn2/machineai/blob/main/firmware/jetson/run.sh),
minus the container. No NVIDIA GPU needed:
[`train.py:20`](https://github.com/ninhnn2/machineai/blob/main/src/train.py#L20)
picks **MPS** on Apple Silicon Macs, `cuda` if present, CPU otherwise. Measured:
21.3 minutes on a MacBook Pro M3. If the script fails with
`Exception: No such file or directory (os error 2)` on the `Tokenizer.from_file`
line, those two files are missing. Run the commands again.

Now pull the embeddings for a few words and measure how alike they are (§1.3):

```bash
cd src && uv run python3 - <<'EOF'
import torch, torch.nn.functional as F
from tokenizers import Tokenizer

tok = Tokenizer.from_file("../data/bpe4096.json")
ck = torch.load("../runs/ple-jetson-s0.pt", map_location="cpu", weights_only=False)
emb = ck["state"]["tok_emb.weight"]          # [4096, 128] = 4096 vectors of 128 dims
print("embedding shape:", tuple(emb.shape))

def tid(w): return tok.encode(" " + w).ids[0]
def cos(a, b): return F.cosine_similarity(emb[a:a+1], emb[b:b+1]).item()

# --- look at ONE vector with your own eyes, before measuring anything ---
torch.set_printoptions(precision=4, sci_mode=False, linewidth=88)
i = tid("cat")
print("token id =", i)
print(emb[i][:16])                                  # 16 of the 128 dimensions
print(f"magnitude = {emb[i].norm():.4f}   std = {emb[i].std():.4f}")

pairs = [("cat","dog"), ("cat","puppy"), ("king","queen"), ("happy","sad"),
         ("cat","the"), ("cat","king")]
for a, b in pairs:
    print(f"{a:6s} vs {b:6s}: cos = {cos(tid(a), tid(b)):+.3f}")
EOF
```

Real measured output, one single run, on a MacBook Pro M3 (MPS):

```
embedding shape: (4096, 128)
token id = 708
tensor([ 0.1700, -0.1482, -0.0753,  0.0389,  0.0437,  0.0198, -0.0931, -0.0767, -0.1027,
        -0.0491, -0.0514, -0.0627,  0.1532,  0.0520, -0.1667,  0.0285])
magnitude = 0.8086   std = 0.0710
cat    vs dog   : cos = +0.704
cat    vs puppy : cos = +0.498
king   vs queen : cos = +0.694
happy  vs sad   : cos = +0.616
cat    vs the   : cos = -0.137
cat    vs king  : cos = +0.249
```

**You may be a little disappointed.** Looking at those 16 numbers you can read
nothing at all. No number says "cat", none says "animal". That deflated feeling
is correct, and it is itself the lesson.

An embedding is not like a `struct` in C where every field has a name you can
read at a glance. It is the opposite: those numbers are everything the model
knows about the token `cat` at the embedding layer, with no dictionary, no rules
and no `if` statement anywhere, and **an embedding only means something when
compared against another embedding**. Three concrete things you can read off the
numbers above:

- **Values are small and near zero** (std 0.071, range ±0.18). Exactly as
  expected: they were initialised by `nn.init.normal_` and then nudged by
  gradient descent, not assigned by hand. No number is "special".
- **Any single value is meaningless to a human.** `emb[708][1] = -0.1482` does
  not mean "cat" and does not mean "animal". As warned in §1.2, dimension 1
  carries no name, and the meaning of `cat` is spread over all 128 dimensions.
- **The whole vector does mean something.** `magnitude = 0.8086` is the length of
  this arrow in 128-dimensional space (§1.1), and it is its direction, not its
  length, that produces `cos(cat, dog) = +0.704` just below.

The mental model to carry through the whole series: **each embedding is a point
in 128-dimensional space**, and the table `tok_emb.weight` is 4096 points
scattered through it. Tokens used in similar contexts get pulled together by
gradient descent, which is the picture from §1.0, except now you have seen one
point's real coordinates.

And this is why working with embeddings is **never about reading individual
elements**. A single coordinate is unreadable, but the *distance between two
points* is readable immediately. So the question is always posed as a comparison,
and the tool that answers it is cosine similarity (§1.3), the six lines you just
printed.

From here on, **everything a transformer does is a transformation of vectors like
this one**: Linear projects them (§1.4), attention compares them against other
vectors with a dot product (§1.3), RMSNorm divides them by their own magnitude
(§1.1). No step ever returns to the letters `c-a-t`. The character string dies at
the embedding table, and from there on there are only numbers.

Your numbers will **not match to the third decimal**, even with `--seed 0`. The
original training run for this material was on CUDA and gave `cat/dog +0.705`,
`king/queen +0.726`, `cat/king +0.222`, up to **0.032** away from the MPS table
above on the worst pair. Different float summation order between two backends is
enough. What **is** reproducible is the ranking and the sign of the six pairs,
not the absolute values. Embeddings should always be read that way, relatively.

Reading the results: `cat`/`dog` are close (both pets, appearing in similar
contexts). `cat`/`the` are almost orthogonal and slightly negative, since a
content word and a function word rarely substitute for one another in a sentence.
`happy`/`sad` are **close despite meaning opposites**, which is the important
lesson: cosine similarity over embeddings measures **"appears in similar
contexts"**, not "means something similar". Do not confuse the two.

Concretely, why: in TinyStories, `happy` and `sad` land in almost exactly the
same sentence frames.

```
The cat is happy.          The cat is sad.
The dog is happy.          The dog is sad.
The child is happy.        The child is sad.
```

The model is only ever trained to **predict the next token**. Given the context
`The cat is ___`, both `happy` and `sad` are valid answers, so gradient descent
(chapter 4) drags both embeddings into the same region, the "state adjective
after `is`" region. Being opposites is a semantic relation; what the model learns
is a **distributional** one. Precisely stated: a high cosine does not mean
"synonym", it means the two tokens **tend to appear in the same kind of context**.
That is a statistical tendency, not a guarantee that swapping one for the other
keeps the sentence true.

## 1.3 Distance between vectors

You have probably written this code a few hundred times:

```c
float a[] = {1, 2, 3};
float b[] = {4, 5, 6};

float sum = 0;
for (int i = 0; i < 3; i++)
    sum += a[i] * b[i];
```

The loop does exactly two things: **multiply each pair of elements**, then **add
everything up**.

```
1×4 =  4
2×5 = 10
3×6 = 18
            ↓
    4 + 10 + 18 = 32
```

Mathematics calls that a **dot product**. Only now is a formula useful, and the
formula is just that loop written compactly:

![Two vectors a=(1,3) and b=(4,2) from the origin with exactly 45 degrees between
them; the multiply-accumulate total is 10, which equals norm a times norm b times
cos 45](/assets/images/study_ai/vector-dot-angle-en.svg)

```
dot(a,b)     = Σ aᵢbᵢ = ‖a‖ ‖b‖ cos(θ)     θ = the angle between the two vectors
```

The left side is the code you just read. **The right side is the surprise**: that
same cheap multiply-accumulate, with nothing added, measures the **angle** between
two vectors. A three-line `for` loop answers "how alike are these two things",
which is why it sits inside every layer of every neural network.

You have also written this exact loop in an FIR filter: `y[n] = Σ h[k]·x[n-k]` is
the dot product of the coefficient vector `h` with a window of the signal.
Attention (chapter 6) does nothing else, millions of dot products between "query"
vectors and "key" vectors, except that both vectors are **learned** rather than
hand-designed like FIR coefficients.

From that one formula come three measures, three different questions. Picking the
wrong one is the most common mistake:

| Measure | Formula | Measures what | Use when |
|---|---|---|---|
| **Dot product** | `Σ aᵢbᵢ` | direction and magnitude together | inside attention, inside every Linear layer |
| **Cosine similarity** | `dot(a,b) / (‖a‖‖b‖)` | **direction only**, magnitude discarded | comparing the meaning of 2 embeddings, semantic search |
| **Euclidean distance** | `√Σ(aᵢ-bᵢ)²` | true distance in the space | clustering, k-NN, when magnitude is physically meaningful |

**Why a raw dot product is not used for "similarity":** a long vector (large
magnitude) produces a large dot product with everything, including things it has
nothing to do with. Magnitude masks direction. Cosine similarity divides by both
magnitudes to strip that noise out, leaving only the angle.

### Practice 2: three measures on one pair of vectors

```python
import torch
a = torch.tensor([3.0, 4.0])          # magnitude 5
b = torch.tensor([6.0, 8.0])          # same direction as a, magnitude 10
c = torch.tensor([4.0, -3.0])         # perpendicular to a

print("dot(a,b)   =", torch.dot(a, b).item())      # 3*6+4*8 = 50 -- LARGE, easy to misread as "very different"
print("cos(a,b)   =", torch.cosine_similarity(a, b, dim=0).item())  # 1.0 -- CORRECT: same direction
print("dist(a,b)  =", torch.dist(a, b).item())      # 5.0
print("dot(a,c)   =", torch.dot(a, c).item())      # 0 -- perpendicular, unrelated
print("cos(a,c)   =", torch.cosine_similarity(a, c, dim=0).item())  # 0.0
```

`a` and `b` share a direction (b = 2a) so **cosine = 1.0 even though their
magnitudes differ completely**, which is what you want when comparing two
embeddings: the magnitude of an embedding mostly reflects how often the token
appears, not how "strong" its meaning is.

## 1.4 Projection

A very practical question first, before any formula:

> There is a vector `x`. How do I find out **how much it resembles direction A**?

You already have the answer from §1.3: take the dot product of `x` with A. The
larger the number, the more it resembles that direction; zero means perpendicular,
nothing in common.

And that is **exactly what an `nn.Linear` layer does**, thousands of times over.
Each row `wᵢ` of the weight matrix is a direction. Each output number,
`yᵢ = dot(wᵢ, x)`, answers one question: "how much does x resemble direction
`wᵢ`?". A Linear layer is a whole set of those questions, asked at once.

Compactly, that is the formula you have seen everywhere:

```
y = Wx
```

Geometrically, `dot(wᵢ, x)` is **the length of the projection of `x` onto
direction `wᵢ`** (up to a factor of `‖wᵢ‖`), and from that follows the split of a
vector into a part parallel to a given direction and the perpendicular remainder:

```
parallel component:       a_∥ = (dot(a,b) / dot(b,b)) · b
perpendicular component:  a_⊥ = a - a_∥
```

![Projecting a onto b: the parallel part lies along the line through b, the
perpendicular part runs from the tip of the parallel part to the tip of a, and
the angle between them is 90 degrees](/assets/images/study_ai/vector-projection-en.svg)

The figure draws exactly these numbers, and you can check them by hand: with
`a = (1,3)` and `b = (4,2)`, `a·b = 1·4 + 3·2 = 10` and `b·b = 20`, so the
coefficient is exactly `½` and `a_∥ = (2,1)`. The remainder is
`a_⊥ = a - a_∥ = (-1,2)`, and you can verify perpendicularity with
`a_⊥·b = -1·4 + 2·2 = 0`. The angle between `a` and `b` happens to land on exactly
45° here.

This is not decorative knowledge: the habit of reading "each weight row is a
question about a direction" carries over unchanged into chapter 3 (matrix
multiplication) and chapter 6 (attention, where Q·K is exactly "how much does this
token resemble that query?").

## 1.5 Tensors: vectors generalised

```
Scalar   :  5                         rank 0 (no dimensions)    1 number
Vector   :  [5, 2, 9]                 rank 1                    1 array
Matrix   :  [[5,2],[9,1]]             rank 2                    2D table
Tensor 3D:  [batch, seq, dim]         rank 3                    a batch of sentences, each a sequence of vectors
Tensor 4D:  [batch, channel, H, W]    rank 4                    images (CNNs use this shape)
```

In `firmware/common/llm.h` every tensor is stored **flat**, the way you are used
to in C, with no `Tensor` class anywhere at runtime:

```c
// llm.h:57 -- ple_table is really a 2D tensor [V, L*P], but stored as one flat byte array
QT ple_table;           // [V, L*P]

// reaching row r (= token id) of a 2D tensor [rows, cols]:
const uint8_t *row = t->codes + (size_t)r * t->row_bytes;   // llm.h:87
//                                          ^^^^^^^^^^^^ = cols * size_of_one_element
```

`shape` (`[rows, cols]`) exists only at the Python/PyTorch level, for your
reasoning. Down in C it disappears and what remains is **stride**, the pointer
step from one row to the next. This is the road you walk every time you debug:
PyTorch says "wrong shape", C says "read the wrong offset". One bug, two views.

### A tensor seen from C: four things travelling together

A tensor is not an exotic data structure. Unpacked, it is exactly:

```
tensor = pointer (memory)  +  shape  +  stride  +  dtype
```

In plain C, a declaration gives you only the first part:

```c
float *buffer;      // you know where the data is, not how to read it
```

The other three live in your head, or in a `// [V, L*P]` comment. But this repo
writes all four out by hand, in the `QT` struct:

```c
// llm.h:27 -- a hand-written "tensor descriptor", no framework required
typedef struct {
  const uint8_t  *codes;   // pointer: memory (int4 packed 2 values per byte)
  const uint16_t *scales;  // pointer: fp16 scale per group
  int rows, cols,          // shape
      group, n_groups,     // dtype: group-wise int4, `group` elements per group
      row_bytes;           // stride: one row step = ceil(cols/2), see exercise 4
} QT;
```

PyTorch stores those same four things, just automatically. That is why one block
of memory can be read as a vector, a matrix or a 4D tensor via
`.view()`/`.reshape()` **without copying a single byte**, and also why
`.transpose()` only changes the stride, leaving a *non-contiguous* tensor, which
will bite you when exporting to `model.bin` (chapter 2).

## Exercises

1. Re-run Practice 1 with 5 other word pairs from TinyStories (`little`, `big`,
   `garden`, `forest`, `mom`, `dad`...). Which pairs did you predict correctly,
   and which surprised you?
2. Compute `magnitude`, then `direction`, of the vector `[3, 4, 0]` by hand.
   Check with `torch.norm` and `F.normalize`.
3. `d_model` in the deployment config is 96
   ([`RESULTS.md`](https://github.com/ninhnn2/machineai/blob/main/RESULTS.md)). A
   96-dimensional embedding **cannot** be drawn on paper. Read up on PCA/t-SNE
   (not used in this repo, but the standard tools for "seeing" high-dimensional
   vectors) and explain in words why projecting down to 2D always loses
   information.
4. In `llm.h:87` (`deq_row`), find the line computing `row_bytes`. Explain with a
   formula why `row_bytes = ceil(cols/2)` for an int4 tensor (2 values per byte).

## Wrapping up

Four things to carry into the next chapter:

1. AI forces all data into vectors **so that "similar" becomes arithmetic**, not
   to store it more compactly (§1.0).
2. A vector has two independent quantities: **direction** and **magnitude**.
   Cosine compares direction, Euclid compares position, dot product mixes both
   (§1.1, §1.3).
3. A high cosine means **tends to appear in the same kind of context**, not
   synonymous (§1.2, `happy`/`sad`).
4. Down in C, a tensor dissolves into `pointer + shape + stride + dtype` (§1.5).

Which raises the obvious question: **where do these vectors come from?** There are
exactly two kinds, and they could hardly be more different:

| | Weight | Activation (hidden state) |
|---|---|---|
| Created when | during training | at run time, for each sentence |
| After training | **frozen forever** | created and thrown away, once per token |
| Where on an ESP32-S3 | read-only, split across SRAM/PSRAM/flash by access pattern (§2.3) | must be writable → SRAM (`s->x[D]`) |
| What it is, in role terms | the **knowledge** the model learned | the model's **thinking** about this sentence |

That split is why a model can both "remember" fixed knowledge and handle each new
sentence flexibly, and it is also why 28.9M read-only parameters can live off-chip
while the writable RAM still fits on an MCU.

→ **Next: Weights, what the model knows.** Which vectors are **fixed** (weights,
learned once and then still) and which **change on every run** (activations,
hidden state). Translation in progress; the full Vietnamese version is at
[`docs/begin_0/02-weight.md`](https://github.com/ninhnn2/machineai/blob/main/docs/begin_0/02-weight.md).

---

*Part of the [AI for embedded engineers](/en/study_ai/) series. Corrections and
bug reports: open an issue at
[github.com/ninhnn2/machineai](https://github.com/ninhnn2/machineai/issues).*
