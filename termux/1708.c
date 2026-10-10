/*
 * 1708 — terminal-native C edition
 * Copyright (c) 2026 Asim Nawaz
 * Licensed under the MIT License (see ../LICENSE).
 *
 * Build in Termux: clang 1708.c -O2 -Wall -Wextra -o 1708
 *
 * This is an initial native port. Puzzle generation and UI are not yet
 * feature-parity verified against the web implementation.
 */
#include <ctype.h>
#include <math.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>

#define TARGET 1708
#define MAX_TILES 16

typedef struct { int add, sub, mul, sq, pow; } Tokens;
typedef enum { ADD=0, SUB, MUL, SQ, POW } Op;
static const char *op_names[] = {"ADD", "SUB", "MUL", "SQ", "POW"};

static int valid_result(Op op, long long a, long long b, int founder, long long *out) {
    long long r = 0;
    switch (op) {
      case ADD:
        if (a == 0 || b == 0) return 0;
        r = a + b; if (r == a || r == b) return 0; break;
      case SUB:
        if (a == b) return 0;
        r = llabs(a-b); if (r == a || r == b) return 0; break;
      case MUL:
        if (a == 0 || b == 0 || a == 1 || b == 1) return 0;
        if (founder && ((a==7 && b==244)||(a==244 && b==7))) return 0;
        if (llabs(a) > 1000000 || llabs(b) > 1000000) return 0;
        r = a*b; if (r == a || r == b) return 0; break;
      case SQ:
        if (a == 0 || a == 1 || llabs(a) > 1000000) return 0;
        r = a*a; if (r == a) return 0; break;
      case POW:
        if (a < 2 || a > 5) return 0;
        r = 1; for (int i=0;i<(int)a;i++) r*=a;
        if (r == a) return 0; break;
    }
    if (r > 35000 && r != TARGET) return 0;
    *out = r; return 1;
}
static int *token_ptr(Tokens *t, Op op) {
    switch(op){case ADD:return &t->add;case SUB:return &t->sub;case MUL:return &t->mul;case SQ:return &t->sq;default:return &t->pow;}
}
static void print_board(long long *tiles, int n, Tokens t) {
    puts("\nTiles:");
    for(int i=0;i<n;i++) printf("  [%d] %lld%s",i+1,tiles[i],(i%4==3||i==n-1)?"\n":"");
    printf("Tokens left: ADD %d | SUB %d | MUL %d | SQ %d | POW %d\n",t.add,t.sub,t.mul,t.sq,t.pow);
}
static int read_int(const char *prompt, int lo, int hi) {
    char line[128], *end; long v;
    for(;;){
        printf("%s",prompt);
        if(!fgets(line,sizeof line,stdin)) return -1;
        v=strtol(line,&end,10);
        while(isspace((unsigned char)*end)) end++;
        if(end!=line && *end=='\0' && v>=lo && v<=hi) return (int)v;
        printf("Enter a number from %d to %d.\n",lo,hi);
    }
}
static void shuffle(int *a,int n) {
    for(int i=n-1;i>0;i--){int j=rand()%(i+1),x=a[i];a[i]=a[j];a[j]=x;}
}
static Tokens random_tokens(void) {
    Tokens t={0,0,0,0,0};
    for(int i=0;i<9;i++) (*token_ptr(&t,(Op)(rand()%5)))++;
    return t;
}
static int any_legal(long long *a,int n,Tokens t,int founder) {
    long long r;
    for(int op=0;op<5;op++) if(*token_ptr(&t,(Op)op)>0)
      for(int i=0;i<n;i++) {
        if(op>=SQ) { if(valid_result((Op)op,a[i],0,founder,&r)) return 1; }
        else for(int j=i+1;j<n;j++) if(valid_result((Op)op,a[i],a[j],founder,&r)) return 1;
      }
    return 0;
}
int main(void) {
    srand((unsigned)time(NULL));
    puts("================================");
    puts("              1708");
    puts("      A number puzzle by Asim");
    puts("================================");
    puts("Native C / Termux edition (initial port)");
    int mode=read_int("\nChoose mode: 1 Classic  2 Founder  3 Practice  4 Exit\n> ",1,4);
    if(mode<1 || mode==4){puts("Goodbye.");return 0;}
    int founder=(mode==2), n=5;
    long long tiles[MAX_TILES]={1,3,5,7,9};
    if(mode==3){
        int pool[12];for(int i=0;i<12;i++)pool[i]=i+1;
        shuffle(pool,12);for(int i=0;i<5;i++)tiles[i]=pool[i];
    }
    Tokens tokens=random_tokens();
    puts("\nGoal: create a tile equal to 1708.");
    puts("Binary operations use two tiles; SQ and POW use one.");
    puts("Choose operation, then tile index/indices. Enter 0 to quit.");
    int moves=0;
    for(;;){
        print_board(tiles,n,tokens);
        for(int i=0;i<n;i++) if(tiles[i]==TARGET){puts("\nYOU WIN! You reached 1708.");return 0;}
        if(!any_legal(tiles,n,tokens,founder)){puts("\nNo legal moves remain. GAME OVER.");return 0;}
        puts("\nOperations: 1 ADD  2 SUB  3 MUL  4 SQ  5 POW  0 Quit");
        int oi=read_int("> ",0,5);if(oi<=0){puts("Game ended.");return 0;}
        Op op=(Op)(oi-1);
        if(*token_ptr(&tokens,op)<=0){puts("No tokens left for that operation.");continue;}
        int ia=read_int("First tile index: ",1,n);if(ia<1) return 0;
        int ib=0;
        if(op<SQ){ib=read_int("Second tile index: ",1,n);if(ib<1)return 0;if(ib==ia){puts("Choose two different tiles.");continue;}}
        long long result;
        if(!valid_result(op,tiles[ia-1],op<SQ?tiles[ib-1]:0,founder,&result)){
            puts("That move is not allowed by the game rules.");continue;
        }
        long long a=tiles[ia-1], b=(op<SQ)?tiles[ib-1]:0;
        printf("%s ",op_names[op]);
        if(op==ADD)printf("%lld + %lld",a,b);
        else if(op==SUB)printf("|%lld - %lld|",a,b);
        else if(op==MUL)printf("%lld x %lld",a,b);
        else if(op==SQ)printf("%lld^2",a);
        else printf("%lld^%lld",a,a);
        printf(" = %lld\n",result);
        if(op<SQ){
            int first=ia-1,second=ib-1;
            if(first>second){int x=first;first=second;second=x;}
            for(int i=second;i<n-1;i++)tiles[i]=tiles[i+1];
            n--;for(int i=first;i<n-1;i++)tiles[i]=tiles[i+1];n--;
        }else{
            for(int i=ia-1;i<n-1;i++)tiles[i]=tiles[i+1];n--;
        }
        if(n<MAX_TILES)tiles[n++]=result;
        (*token_ptr(&tokens,op))--;moves++;
        if(result==TARGET){print_board(tiles,n,tokens);printf("\nYOU WIN in %d moves!\n",moves);return 0;}
    }
}
